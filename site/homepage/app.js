const menuButton = document.querySelector('.menu-button');
const siteNav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  siteNav.classList.toggle('open', !open);
});

siteNav?.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  menuButton?.setAttribute('aria-expanded', 'false');
  siteNav.classList.remove('open');
});

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: '0px 0px -48px' });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const header = document.querySelector('.site-header');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 18);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const storySteps = [
  {
    source: '产品方向群 · 09:02',
    title: '第一版先做网页，还是小程序？',
    description: '孙宇杰在群里提出问题。讨论从这里开始；后续会议和文件会接到同一个议题下。',
    author: '孙宇杰 · 群聊',
    quote: '“几句话讲不透，我们九点半开会继续讨论。”',
    payoff: '同一个问题，持续的上下文。'
  },
  {
    source: '产品同步会 · 09:30—09:48',
    title: '会议原话回到原来的群聊议题',
    description: '张轩灏主张先用网页验证；卢格妤担心入口成本。两段原话和共享的访谈文件一起接回群聊，不只生成一份独立纪要。',
    author: '卢格妤 · 会议转写 09:38',
    quote: '“网页会增加进入成本，这个风险需要留下来。”',
    payoff: '会前问题、会上分歧、会后确认，连在一起。'
  },
  {
    source: '产品方向群 · 10:06',
    title: '在群里邀请 AI，完整上下文也能导出',
    description: '团队直接 @织见机器人，请它结合群聊、会议原话和文件提出方案。分析回到群聊；结构化上下文可以导出给团队选择的模型。',
    author: '孙宇杰 · 群聊',
    quote: '“@织见机器人，结合会议原话和访谈文件，给一个可验证的方案。”',
    payoff: 'AI 参与原讨论，模型选择权留给团队。'
  }
];

const storyTabs = [...document.querySelectorAll('[data-story]')];
const storyPanel = document.querySelector('#story-panel');

function showStory(index) {
  const step = storySteps[index];
  if (!step || !storyPanel) return;
  const values = {
    '.story-source': step.source,
    '.story-step': `${index + 1} / ${storySteps.length}`,
    '.story-title': step.title,
    '.story-quote': step.description,
    '.story-evidence span': step.author,
    '.story-evidence strong': step.quote,
    '.story-payoff': step.payoff
  };
  for (const [selector, value] of Object.entries(values)) {
    storyPanel.querySelector(selector).textContent = value;
  }
  storyTabs.forEach((tab, tabIndex) => {
    tab.setAttribute('aria-selected', String(tabIndex === index));
    tab.tabIndex = tabIndex === index ? 0 : -1;
  });
}

storyTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showStory(index));
  tab.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + storyTabs.length) % storyTabs.length;
    showStory(next);
    storyTabs[next].focus();
  });
});
