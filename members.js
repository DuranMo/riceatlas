const ID_PATTERN = /^[a-z][a-z0-9]*$/;

export function validNetid(id) {
  return typeof id === 'string' && id.length <= 64 && ID_PATTERN.test(id);
}

export function validateMembers(data) {
  if (!Array.isArray(data)) throw new Error('The membership file must contain a list.');
  const ids = new Set();
  return data.map((member) => {
    if (!member || !validNetid(member.netid) || ids.has(member.netid)) {
      throw new Error('The membership file contains an invalid or duplicate NetID.');
    }
    if (typeof member.name !== 'string' || !member.name.trim()) {
      throw new Error('A member is missing a name.');
    }
    let url;
    try { url = new URL(member.url); } catch {
      throw new Error('A member has an invalid website URL.');
    }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Member websites must use HTTP or HTTPS without embedded credentials.');
    }
    if (member.year !== undefined && !/^\d{4}$/.test(String(member.year))) {
      throw new Error('Graduation years must have four digits.');
    }
    if (member.degree !== undefined && (typeof member.degree !== 'string' || !member.degree.trim())) {
      throw new Error('A member has an invalid degree.');
    }
    ids.add(member.netid);
    return {
      netid: member.netid, name: member.name.trim(), url: url.href,
      degree: member.degree?.trim(), year: member.year,
    };
  });
}

export async function fetchMembers() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(new URL('members.json', import.meta.url), {
      cache: 'no-store', signal: controller.signal,
    });
    if (!response.ok) throw new Error('Membership request failed.');
    return validateMembers(await response.json());
  } finally { clearTimeout(timeout); }
}

export function neighbor(members, id, direction) {
  if (!validNetid(id)) throw new Error('This link has a missing or invalid Rice NetID.');
  if (!['prev', 'next'].includes(direction)) {
    throw new Error('This link needs a direction of prev or next.');
  }
  if (!members.length) throw new Error('The ring has no members yet.');
  const index = members.findIndex((member) => member.netid === id);
  if (index === -1) throw new Error('This member is no longer listed, or the Rice NetID is incorrect.');
  return members[(index + (direction === 'next' ? 1 : -1) + members.length) % members.length];
}
