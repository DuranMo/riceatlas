import { fetchMembers, neighbor, validNetid } from './members.js';

const status = document.querySelector('#nav-status');
const retry = document.querySelector('#retry-navigation');
const destination = document.querySelector('#destination');

async function navigate() {
  retry.hidden = true;
  destination.hidden = true;
  status.textContent = 'Finding your neighbor…';
  const params = new URLSearchParams(location.search);
  const netid = params.get('netid');
  const direction = params.get('dir');
  const random = direction === 'random';
  if (!random && (params.getAll('netid').length !== 1 || !validNetid(netid))) {
    status.textContent = 'This link has a missing or invalid Rice NetID.';
    return;
  }
  if (params.getAll('dir').length !== 1 || !['prev', 'next', 'random'].includes(direction)) {
    status.textContent = 'This link needs a direction of prev, next, or random.';
    return;
  }
  let members;
  try { members = await fetchMembers(); } catch {
    status.textContent = 'We couldn’t load the membership list. Please try again in a moment.';
    retry.hidden = false;
    return;
  }
  try {
    if (!members.length) throw new Error('The ring has no members yet.');
    const member = random
      ? members[Math.floor(Math.random() * members.length)]
      : neighbor(members, netid, direction);
    status.textContent = `Taking you to ${member.name}…`;
    destination.href = member.url;
    destination.textContent = `Continue to ${member.name} ↗`;
    destination.hidden = false;
    location.replace(member.url);
  } catch (error) { status.textContent = error.message; }
}

retry.addEventListener('click', navigate);
navigate();
