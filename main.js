import { fetchMembers } from './members.js';

const status = document.querySelector('#members-status');
const retry = document.querySelector('#retry-members');
async function loadDirectory() {
  retry.hidden = true;
  status.textContent = 'Loading members…';
  try {
    const members = await fetchMembers();
    const list = document.querySelector('#members');
    list.replaceChildren();
    for (const member of members) {
      const item = document.createElement('li');
      item.id = member.netid;
      const link = document.createElement('a');
      link.href = member.url;
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
  } catch {
    status.textContent = 'We couldn’t load the member list. Please try again in a moment.';
    retry.hidden = false;
  }
}
retry.addEventListener('click', loadDirectory);
loadDirectory();

