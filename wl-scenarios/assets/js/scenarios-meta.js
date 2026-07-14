// 시나리오 파생 메타 (doc 마스터 목록 기반, 사실 정보). 변환·인덱스 공용.
// date/date_display/theater/forces_en 는 SCENARIO_META 가 권위값.

export const SCENARIO_META = {
  S01: { date: '1944-08-20', date_display: '1944년 8월 20일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S02: { date: '1943-12-24', date_display: '1943년 12월 24일', theater: 'pacific', forces_en: 'Allied vs. Japanese' },
  S03: { date: '1945-03-02', date_display: '1945년 3월 2일', theater: 'euro-west', forces_en: 'Allied vs. German' },
  S04: { date: '1944-06-11', date_display: '1944년 6월 11일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S05: { date: '1943-12-01', date_display: '1943년 12월 1일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S06: { date: '1944-08', date_display: '1944년 8월', theater: 'euro-east', forces_en: 'Soviet vs. Romanian' },
  S07: { date: '1945-02-09', date_display: '1945년 2월 9일', theater: 'euro-west', forces_en: 'British vs. German' },
  S08: { date: '1944-06-06', date_display: '1944년 6월 6일', theater: 'euro-west', forces_en: 'Allied vs. German' },
  S09: { date: '1944-05-04', date_display: '1944년 5월 4일', theater: 'euro-east', forces_en: 'Soviet vs. German' },
  S10: { date: '1945-05-09', date_display: '1945년 5월 9일', theater: 'pacific', forces_en: 'British vs. Japanese' },
  S11: { date: '1943-11-01', date_display: '1943년 11월 1일', theater: 'pacific', forces_en: 'Allied vs. Japanese' },
  S12: { date: '1944-05-30', date_display: '1944년 5월 30일', theater: 'euro-east', forces_en: 'Soviet vs. German' },
  S13: { date: '1944-06-10', date_display: '1944년 6월 10일', theater: 'euro-east', forces_en: 'American vs. Romanian' },
  S14: { date: '1945-05-11', date_display: '1945년 5월 11일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S15: { date: '1945-03-19', date_display: '1945년 3월 19일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S16: { date: '1944-02', date_display: '1944년 2월', theater: 'euro-west', forces_en: 'American vs. German' },
  S17: { date: '1944-07-14', date_display: '1944년 7월 14일', theater: 'euro-east', forces_en: 'Soviet vs. German' },
  S18: { date: '1943-09-02', date_display: '1943년 9월 2일', theater: 'euro-west', forces_en: 'Allied vs. German' },
  S19: { date: '1944-03-18', date_display: '1944년 3월 18일', theater: 'med', forces_en: 'American vs. Axis' },
  S20: { date: '1945-02-09', date_display: '1945년 2월 9일', theater: 'euro-west', forces_en: 'American vs. German' },
  S21: { date: '1943-10', date_display: '1943년 10월', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S22: { date: '1944-03-06', date_display: '1944년 3월 6일', theater: 'euro-west', forces_en: 'American vs. German' },
  S23: { date: '1944-03-06', date_display: '1944년 3월 6일', theater: 'euro-west', forces_en: 'American vs. German' },
  S24: { date: '1945-01-01', date_display: '1945년 1월 1일', theater: 'euro-west', forces_en: 'Allied vs. German' },
  S25: { date: '1944-07-26', date_display: '1944년 7월 26일', theater: 'euro-east', forces_en: 'Soviet vs. German' },
  S26: { date: '1943-11-11', date_display: '1943년 11월 11일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S27: { date: '1943-04-03', date_display: '1943년 4월 3일', theater: 'euro-west', forces_en: 'Allied vs. German' },
  S28: { date: '1944-11-24', date_display: '1944년 11월 24일', theater: 'pacific', forces_en: 'American vs. Japanese' },
  S29: { date: '1943-07-06', date_display: '1943년 7월 6일', theater: 'euro-east', forces_en: 'Soviet vs. German' },
  S30: { date: '1943-10-10', date_display: '1943년 10월 10일', theater: 'euro-west', forces_en: 'American vs. German' },
  S31: { date: '1943-08-22', date_display: '1943년 8월 22일', theater: 'med', forces_en: 'American vs. German' },
  S32: { date: '1945-03-02', date_display: '1945년 3월 2일', theater: 'euro-west', forces_en: 'American vs. German' },
  S33: { date: '1944-12-12', date_display: '1944년 12월 12일', theater: 'euro-west', forces_en: 'British vs. German' },
  S34: { date: '1944-12-24', date_display: '1944년 12월 24일', theater: 'euro-west', forces_en: 'British vs. German' },
  S35: { date: '1944-09-11', date_display: '1944년 9월 11일', theater: 'euro-west', forces_en: 'American vs. German' },
};

// 국적 표기 → 색 코드 키 (원문 표기 변형 '미군/일본군' 등 포함)
export const NATION = {
  '미국': 'us', '미군': 'us', '일본': 'jp', '일본군': 'jp', '연합군': 'al',
  '독일': 'de', '독일군': 'de', '영국': 'gb', '영국군': 'gb', '캐나다': 'ca',
  '소련': 'su', '소련군': 'su', '루마니아': 'ro', '루마니아군': 'ro',
  '이탈리아': 'it', '이탈리아군': 'it', '추축군': 'ax', '핀란드': 'fi', '핀란드군': 'fi',
  '중국': 'cn', '중국군': 'cn',
};

// 색 코드 → 진영 박스 기본 배경색
export const CODE_COLOR = {
  us: '#e6e7f4', jp: '#f5dede', al: '#e4e6f3', de: '#e6e8ea', gb: '#e4ecf4',
  ca: '#e7eef2', su: '#f2e2e2', ro: '#e8f0e4', it: '#eef0e0', ax: '#ece6e0', fi: '#e4eef0', cn: '#f0eae0',
};

// 기체명 → 마크 국적 (연합군 진영의 marks 판별용)
export const AIRCRAFT_NATION = {
  us: ['F4U', 'Corsair', 'F6F', 'Hellcat', 'P-38', 'P-39', 'P-40', 'Warhawk', 'P-47', 'P-51',
       'B-17', 'B-24', 'B-25', 'B-26', 'B-29', 'A-20', 'A-36', 'SBD', 'SB2C', 'TBF', 'TBM', 'PB4Y'],
  gb: ['Spitfire', 'Seafire', 'Tempest', 'Typhoon', 'Beaufighter', 'Mosquito', 'Lancaster',
       'Halifax', 'Kittyhawk', 'Mustang Mk', 'Beaufort'],
};
