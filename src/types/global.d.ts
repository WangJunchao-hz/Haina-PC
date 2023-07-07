declare interface MenuItem {
	key: string
	icon: any
	label: string
	children?: {
		key: string
		icon?: any
		label: string
	}[]
}
declare interface BreadcrumbItem {
	key: string
	icon: any
	label: string
}
declare interface SimpleTableColumn {
	label: string
	prop: string
}
declare interface SingleZhiShu {
	date?: string
	yesterday?: {
		ztNum: number // 涨停数量
		lbNum: number // 连板数量
		firstNum: number // 首板数量
		fbbNum: number // 反包板数量
		hpNum: number // 红盘数量
		z5Num: number // 涨幅大于等于5的数量
		dtNum: number // 跌停数量
		ltNum: number // 连续跌停数量
		lpNum: number // 绿盘数量
		d5Num: number // 跌幅大于等于5的数量
		dbNum: number // 断板数量
	}
	today?: {
		ztNum: number // 涨停数量
		lbNum: number // 连板数量
		firstNum: number // 首板数量
		fbbNum: number // 反包板数量
		hpNum: number // 红盘数量
		z5Num: number // 涨幅大于等于5的数量
		dtNum: number // 跌停数量
		ltNum: number // 连续跌停数量
		lpNum: number // 绿盘数量
		d5Num: number // 跌幅大于等于5的数量
		dbNum: number // 断板数量
	}
	score?: number
	/**赚钱效应 */
	profitEffect?: {
		score?: number
		first?: {
			jzb: number // 今日昨日首板比
			zrhpb: number // 昨日首板红盘比
			zrz5b: number // 昨日首板涨5比
			zrjjl: number // 昨日首板晋级率
			score?: number
		}
		lb?: {
			jzb: number // 今日昨日连板比
			zrhpb: number // 昨日连板红盘比
			zrz5b: number // 昨日连板涨5比
			zrjjl: number // 昨日晋级率
			score?: number
		}
		fb?: {
			jzb: number // 今日昨日反包板比
			zrhpb: number // 昨日反包板红盘比
			zrz5b: number // 昨日反包板涨5比
			zrjjl: number // 昨日反包板晋级率
			score?: number
		}
		sc?: {
			jzztb: number // 今日昨日涨停比
			jzhpb: number // 今日昨日红盘比
			jzz5b: number // 今日昨日涨5比
			lbHeight?: number // 连板高度
			score?: number
		}
		db?: {
			hpb: number // 昨日断板今日红盘比
			z5b: number // 昨日断板今日涨5比
			fbl: number // 昨日断板今日反包率
			score?: number
		}
	}
	/**赚钱统计 */
	profit?: {
		score?: number
		first?: {
			num: number // 今日首板数
			zrhp: number // 昨日首板今日红盘数
			zrz5: number // 昨日首板今日涨5数
			zrjj: number // 昨日首板晋级率
			diffRate: 1 // 统一分数基准用，使得出的分数更客观
			score?: number // 总计40分
		}
		lb?: {
			num: number
			zrhp: number
			zrz5: number
			zrjj: number
			diffRate: 1
			score?: number // 总计40分
		}
		fb?: {
			num: number
			zrhp: number
			zrz5: number
			zrjj: number
			diffRate: 1
			score?: number // 总计40分
		}
		sc?: {
			zt: number
			lb: number
			hp: number
			z5: number
			lbHeight?: number
			diffRate: 1
			score?: number // 总计40分
		}
		db?: {
			hp: number
			z5: number
			fb: number
			diffRate: 1.33
			score?: number // 总计30分
		}
	}
	/**亏钱效应 */
	lossEffect?: {
		score?: number
		first?: {
			zrlpb: number // 昨日首板绿盘比
			zrd5b: number // 昨日首板跌5比
			score?: number
		}
		lb?: {
			zrlpb: number // 昨日连板绿盘比
			zrd5b: number // 昨日连板跌5比
			score?: number
		}
		fb?: {
			zrlpb: number
			zrd5b: number
			score?: number
		}
		sc?: {
			jzdtb: number // 今日昨日跌停比
			jzlpb: number // 今日昨日绿盘比
			jzd5b: number // 今日昨日跌5比
			ltHeight?: number // 连停高度
			score?: number
		}
		db?: {
			jzb: number // 今日昨日断板比
			lpb: number // 昨日断板今日绿盘比
			d5b: number // 昨日断板今日跌5比
			score?: number
		}
	}
	loss?: {
		score?: number
		first?: {
			zrlp: number
			zrd5: number
			diffRate: 2
			score?: number // 总计20分
		}
		lb?: {
			zrlp: number
			zrd5: number
			diffRate: 2
			score?: number // 总计20分
		}
		fb?: {
			zrlp: number
			zrd5: number
			diffRate: 2
			score?: number // 总计20分
		}
		sc?: {
			dt: number
			lt: number
			lp: number
			d5: number
			ltHeight?: number
			diffRate: 1
			score?: number // 总计40分
		}
		db?: {
			num: number
			lp: number
			d5: number
			diffRate: 1.33
			score?: number // 总计30分
		}
	}
}
declare interface SingleEmotion {
	date?: string // 日期
	hot?: number // 狂热指数 每日涨停数，不包含ST股,不包含新股
	scare?: number // 恐慌指数 每天盘跌幅大于5%的股票数
	lb?: {
		// 连板指数
		score?: number
		profit?: {}
		loss?: {}
	}
	sc?: {
		// 市场指数
		score?: number
		profit?: {}
		loss?: {}
	}
	sb?: {
		// 首板指数
		score?: number
		profit?: {}
		loss?: {}
	}
	main?: {
		// 主板指数
		score?: number
		profit?: {}
		loss?: {}
	}
	cy?: {
		// 创业板指数
		score?: number
		profit?: {}
		loss?: {}
	}
	kc?: {
		// 科创板指数
		score?: number
		profit?: {}
		loss?: {}
	}
	bjs?: {
		// 北交所指数
		score?: number
		profit?: {}
		loss?: {}
	}
}
