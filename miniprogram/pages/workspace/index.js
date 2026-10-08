const scenario = require('../../data/scenario.js');
const { buildContext, toMarkdown, answerQuestion } = require('../../lib/context.js');

const STORE_KEY = 'zhijian-mini-events-v1';
const now = () => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

function decorate(events) {
  return events.map((event, index) => ({
    ...event,
    ref: `E${String(index + 1).padStart(3, '0')}`,
    isMeeting: event.source === '产品同步会' || event.type === 'meeting-start' || event.type === 'meeting-note' || event.type === 'meeting-end',
    isBot: event.author === '织见机器人',
    isFile: event.type === 'file',
    initials: event.initials || (event.author || '?').slice(0, 1)
  }));
}

Page({
  data: {
    tab: 'timeline',
    events: [],
    meetingEvents: [],
    decisions: [scenario.decision],
    title: scenario.title,
    question: scenario.question,
    input: '',
    meetingInput: '',
    meetingActive: false,
    exportOpen: false,
    exportFormat: 'markdown',
    exportPreview: '',
    counts: { events: 0, meeting: 0, decisions: 1 }
  },

  onLoad() {
    let extra = [];
    try { extra = wx.getStorageSync(STORE_KEY) || []; } catch (_) { extra = []; }
    this.extraEvents = Array.isArray(extra) ? extra : [];
    this.refresh();
  },

  refresh() {
    const events = decorate([...scenario.events, ...this.extraEvents]);
    const meetingEvents = events.filter((event) => event.isMeeting || event.source === '会议共享文件');
    this.setData({
      events,
      meetingEvents,
      counts: { events: events.length, meeting: meetingEvents.length, decisions: scenario.decision ? 1 : 0 }
    });
  },

  selectTab(event) { this.setData({ tab: event.currentTarget.dataset.tab }); },
  onInput(event) { this.setData({ input: event.detail.value }); },
  onMeetingInput(event) { this.setData({ meetingInput: event.detail.value }); },
  appendEvent(event) {
    this.extraEvents.push(event);
    wx.setStorageSync(STORE_KEY, this.extraEvents);
    this.refresh();
  },

  send() {
    const content = this.data.input.trim();
    if (!content) return;
    this.appendEvent({
      stage: 3, time: now(), source: '产品方向群', author: '孙宇杰', initials: '孙',
      type: 'human', title: '群聊消息', body: content
    });
    this.setData({ input: '', tab: 'timeline' });
    if (content.includes('@织见机器人')) {
      const context = buildContext(scenario, [...scenario.events, ...this.extraEvents], [scenario.decision]);
      this.appendEvent({
        stage: 3, time: now(), source: '产品方向群', author: '织见机器人', initials: '织',
        type: 'ai', title: '根据讨论上下文回答', body: answerQuestion(content, context)
      });
    }
  },

  mentionBot() { this.setData({ input: `${this.data.input}@织见机器人 `, tab: 'timeline' }); },
  startMeeting() {
    if (this.data.meetingActive) return;
    this.setData({ meetingActive: true, tab: 'meeting' });
    this.appendEvent({
      stage: 3, time: now(), source: '产品同步会', author: '会议', initials: '会',
      type: 'meeting-start', title: '新会议开始', body: '这场会议继续当前群聊议题。可在下方记录发言，内容会同步进入讨论时间线。'
    });
  },
  addMeetingNote() {
    const content = this.data.meetingInput.trim();
    if (!content) return;
    this.appendEvent({
      stage: 3, time: now(), source: '产品同步会', author: '孙宇杰', initials: '孙',
      type: 'meeting-note', title: '会议发言 · 手动记录', body: content
    });
    this.setData({ meetingInput: '' });
  },
  endMeeting() {
    if (!this.data.meetingActive) return;
    this.appendEvent({
      stage: 3, time: now(), source: '产品同步会', author: '会议', initials: '会',
      type: 'meeting-end', title: '会议结束', body: '会议发言已接回当前讨论时间线，可继续在群里讨论和引用。'
    });
    this.setData({ meetingActive: false });
  },
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (result) => {
        const file = result.tempFiles[0];
        if (!file) return;
        this.appendEvent({
          stage: 3, time: now(), source: this.data.meetingActive ? '会议共享文件' : '产品方向群',
          author: '孙宇杰', initials: '孙', type: 'file', title: file.name,
          body: `共享文件：${file.name}。本演示仅记录文件名称，未上传或解析文件内容。`
        });
        wx.showToast({ title: '文件已加入时间线', icon: 'success' });
      },
      fail: (error) => {
        if (!String(error.errMsg || '').includes('cancel')) wx.showToast({ title: '未能选择文件', icon: 'none' });
      }
    });
  },
  openExport() { this.setData({ exportOpen: true }); this.updateExport(); },
  closeExport() { this.setData({ exportOpen: false }); },
  noop() {},
  setExportFormat(event) { this.setData({ exportFormat: event.currentTarget.dataset.format }); this.updateExport(); },
  exportText() {
    const context = buildContext(scenario, [...scenario.events, ...this.extraEvents], [scenario.decision]);
    return this.data.exportFormat === 'json' ? JSON.stringify(context, null, 2) : toMarkdown(context);
  },
  updateExport() { this.setData({ exportPreview: this.exportText() }); },
  copyExport() {
    wx.setClipboardData({ data: this.exportText(), success: () => wx.showToast({ title: '已复制，可粘贴给任意 AI', icon: 'none' }) });
  },
  saveExport() {
    const extension = this.data.exportFormat === 'json' ? 'json' : 'md';
    const path = `${wx.env.USER_DATA_PATH}/zhijian-discussion-${Date.now()}.${extension}`;
    wx.getFileSystemManager().writeFile({
      filePath: path, data: this.exportText(), encoding: 'utf8',
      success: () => wx.showModal({ title: '已保存到小程序本地', content: `文件路径：${path}\n可使用“复制内容”粘贴到其他工具。`, showCancel: false }),
      fail: () => wx.showToast({ title: '保存失败，请复制内容', icon: 'none' })
    });
  },
  clearLocal() {
    wx.showModal({
      title: '清除本机新增内容？', content: '预置演示数据会保留。',
      success: (result) => {
        if (!result.confirm) return;
        this.extraEvents = [];
        wx.removeStorageSync(STORE_KEY);
        this.setData({ meetingActive: false });
        this.refresh();
      }
    });
  }
});
