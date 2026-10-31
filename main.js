import { fetchMembers } from './members.js';
import { drawConstellation } from './constellation.js';

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
      const item = document.createElement('tr');
      item.id = member.netid;
      const graduationYear = member.year || '—';
      for (const value of [member.name, member.degree || '—', graduationYear]) {
        const cell = document.createElement('td');
        cell.textContent = String(value);
        item.append(cell);
      }
      const website = document.createElement('td');
      const link = document.createElement('a');
      link.href = member.url;
      const url = new URL(member.url);
      link.textContent = url.host + (url.pathname === '/' ? '' : url.pathname);
      link.setAttribute('aria-label', `${member.name}’s website`);
      website.append(link);
      item.append(website);
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
drawConstellation();

