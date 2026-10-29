import { fetchMembers } from './members.js';

// Temporary layout preview. Set to 0 to return to the real directory.
const DEMO_MEMBER_COUNT = 31;

const status = document.querySelector('#members-status');
const retry = document.querySelector('#retry-members');
async function loadDirectory() {
  retry.hidden = true;
  status.textContent = 'Loading members…';
  try {
    const members = await fetchMembers();
    const list = document.querySelector('#members');
    list.replaceChildren();
    const demos = Array.from({ length: DEMO_MEMBER_COUNT }, (_, index) => ({
      netid: `demo${index + 1}`,
      name: `sample student ${String(index + 1).padStart(2, '0')}`,
      demo: true,
    }));
    for (const member of [...members, ...demos]) {
      const item = document.createElement('li');
      item.id = member.netid;
      const link = document.createElement(member.demo ? 'span' : 'a');
      if (member.demo) {
        link.className = 'demo-member';
        link.title = 'Demo entry for layout preview';
      } else {
        link.href = member.url;
      }
      link.textContent = member.name;
      item.append(link);
      if (member.year !== undefined) {
        const year = document.createElement('span');
        year.className = 'member-year';
        year.textContent = String(member.year);
        item.append(year);
      }
      list.append(item);
    }
    status.textContent = members.length ? '' : 'The ring is waiting for its first member.';
    document.querySelector('#demo-note').hidden = DEMO_MEMBER_COUNT === 0;
  } catch {
    status.textContent = 'We couldn’t load the member list. Please try again in a moment.';
    retry.hidden = false;
  }
}
retry.addEventListener('click', loadDirectory);
loadDirectory();

