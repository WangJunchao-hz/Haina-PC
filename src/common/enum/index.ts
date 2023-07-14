export const FirstZtColumns: SimpleTableColumn[] = [
	{
		label: '首板',
		prop: 'num',
	},
	{
		label: '晋级率',
		prop: 'zrjjl',
	},
	{
		label: '红盘比',
		prop: 'zrhpb',
	},
	{
		label: '绿盘比',
		prop: 'zrlpb',
	},
	{
		label: '涨5比',
		prop: 'zrz5b',
	},
	{
		label: '跌5比',
		prop: 'zrd5b',
	},
]
export const LbZtColumns: SimpleTableColumn[] = [
	{
		label: '连板',
		prop: 'num',
	},
	{
		label: '晋级率',
		prop: 'zrjjl',
	},
	{
		label: '红盘比',
		prop: 'zrhpb',
	},
	{
		label: '绿盘比',
		prop: 'zrlpb',
	},
	{
		label: '涨5比',
		prop: 'zrz5b',
	},
	{
		label: '跌5比',
		prop: 'zrd5b',
	},
]
export const FbZtColumns: SimpleTableColumn[] = [
	{
		label: '反包板',
		prop: 'num',
	},
	{
		label: '晋级率',
		prop: 'zrjjl',
	},
	{
		label: '红盘比',
		prop: 'zrhpb',
	},
	{
		label: '绿盘比',
		prop: 'zrlpb',
	},
	{
		label: '涨5比',
		prop: 'zrz5b',
	},
	{
		label: '跌5比',
		prop: 'zrd5b',
	},
]
export const DbColumns: SimpleTableColumn[] = [
	{
		label: '断板',
		prop: 'num',
	},
	{
		label: '反包率',
		prop: 'fbl',
	},
	{
		label: '红盘比',
		prop: 'hpb',
	},
	{
		label: '绿盘比',
		prop: 'lpb',
	},
	{
		label: '涨5比',
		prop: 'z5b',
	},
	{
		label: '跌5比',
		prop: 'd5b',
	},
]
export const SCColumns: SimpleTableColumn[] = [
	{
		label: '涨停',
		prop: 'zt',
	},
	{
		label: '跌停',
		prop: 'dt',
	},
	{
		label: '红盘',
		prop: 'hp',
	},
	{
		label: '绿盘',
		prop: 'lp',
	},
	{
		label: '涨5',
		prop: 'z5',
	},
	{
		label: '跌5',
		prop: 'd5',
	},
	{
		label: '连板高度',
		prop: 'lbHeight',
	},
	{
		label: '连停高度',
		prop: 'ltHeight',
	},
]
export const TrendStockColumns: {
	title: string
	dataIndex: string
	[name: string]: any
}[] = [
	{
		title: '排名',
		dataIndex: 'ranking',
		sorter: (a: any, b: any) => b.ranking - a.ranking,
	},
	{
		title: '变化',
		dataIndex: 'change',
		sorter: (a: any, b: any) => b.change - a.change,
	},
	{
		title: '股票',
		dataIndex: 'nameAndCode',
	},
	{
		title: '10日区间涨幅',
		dataIndex: 'qjzdf',
		width: 118,
	},
	{
		title: '涨跌幅',
		dataIndex: 'zdf',
	},
	{
		title: '类型',
		dataIndex: 'sclx',
	},
	{
		title: '所属概念',
		dataIndex: 'gns',
		width: 388,
	},
]
export const TrendStockListColumns: {
	title: string
	dataIndex: string
	[name: string]: any
}[] = [
	{
		title: '排名',
		dataIndex: 'ranking',
		sorter: (a: any, b: any) => b.ranking - a.ranking,
	},
	{
		title: '变化',
		dataIndex: 'change',
		sorter: (a: any, b: any) => b.change - a.change,
	},
	{
		title: '股票',
		dataIndex: 'nameAndCode',
	},
	{
		title: '10日区间涨幅',
		dataIndex: 'qjzdf',
		width: 118,
	},
	{
		title: '涨跌幅',
		dataIndex: 'zdf',
	},
	{
		title: '指数',
		dataIndex: 'score',
		sorter: (a: any, b: any) => b.score - a.score,
	},
	{
		title: '赚钱效应',
		dataIndex: 'profit',
		sorter: (a: any, b: any) => b.profit - a.profit,
	},
	{
		title: '亏钱效应',
		dataIndex: 'loss',
		sorter: (a: any, b: any) => b.loss - a.loss,
	},
	{
		title: '类型',
		dataIndex: 'sclx',
	},
	{
		title: '所属概念',
		dataIndex: 'gns',
		width: 388,
	},
]
export const TrendGnColumns: {
	title: string
	dataIndex: string
	[name: string]: any
}[] = [
	{
		title: '排名',
		dataIndex: 'ranking',
		sorter: (a: any, b: any) => b.ranking - a.ranking,
	},
	{
		title: '变化',
		dataIndex: 'change',
		sorter: (a: any, b: any) => b.change - a.change,
	},
	{
		title: '概念',
		dataIndex: 'label',
	},
	{
		title: '个股数量',
		dataIndex: 'num',
	},
]
export const TrendCycleGnColumns: {
	title: string
	dataIndex: string
	[name: string]: any
}[] = [
	{
		title: '概念',
		dataIndex: 'label',
	},
	{
		title: '天数',
		dataIndex: 'num',
		sorter: (a: any, b: any) => b.num - a.num,
	},
	{
		title: '指数',
		dataIndex: 'score',
		sorter: (a: any, b: any) => b.score - a.score,
	},
	{
		title: '赚钱效应',
		dataIndex: 'profit',
		sorter: (a: any, b: any) => b.profit - a.profit,
	},
	{
		title: '亏钱效应',
		dataIndex: 'loss',
		sorter: (a: any, b: any) => b.loss - a.loss,
	},
]
export const GNAColumns: SimpleTableColumn[] = [
	{
		label: '指数',
		prop: 'score',
	},
	{
		label: '赚钱效应',
		prop: 'profit',
	},
	{
		label: '亏钱效应',
		prop: 'loss',
	},
	{
		label: '红盘',
		prop: 'hpb',
	},
	{
		label: 'lp',
		prop: 'lpb',
	},
	{
		label: '涨5',
		prop: 'z5b',
	},
	{
		label: '跌5',
		prop: 'd5b',
	},
	{
		label: '涨9.8',
		prop: 'z9_8b',
	},
	{
		label: '跌9.8',
		prop: 'd9_8b',
	},
]
