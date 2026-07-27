// Shared「限時模式」settings row — spread into each game's settings array:
//   { ...TIMED_SETTING, selected: timed, onChange: setTimed }
export const TIMED_SETTING = {
  label: '限時模式',
  options: [
    { value: false, icon: '😌', text: '悠閒模式', sub: '不限時' },
    { value: true,  icon: '⏱️', text: '限時挑戰', sub: '10 秒' },
  ],
};
