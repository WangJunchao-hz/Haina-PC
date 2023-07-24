import dayjs, { Dayjs } from 'dayjs'
import { GetHoliday } from '@/common/api/third-party-api'
export const Cache = {
	set(type: string, key: string | number, value: any) {
		let newValue: any = {}
		const oldValue = localStorage.getItem(type)
		if (oldValue) {
			newValue = JSON.parse(oldValue)
		}
		newValue[key] = value
		localStorage.setItem(type, JSON.stringify(newValue))
	},
	get(type: string, key?: string | number) {
		let res: any
		const value = localStorage.getItem(type)
		if (value && key) {
			res = JSON.parse(value)[key]
		} else if (value) {
			res = JSON.parse(value)
		}
		return res
	},
}
export function replaceTpl(str: string, reStr: string) {
	if (!reStr) {
		console.error('date is error')
		return str
	}
	const y = reStr.split('-')[0]
	let cache = Cache.get('holiday', y)
	if (!cache) {
		console.error('cache not find')
		cache = []
	}
	let q1 = dayjs(reStr).subtract(1, 'd').format('YYYY-MM-DD')
	while (cache.includes(q1)) {
		q1 = dayjs(q1).subtract(1, 'd').format('YYYY-MM-DD')
	}
	let q2 = dayjs(q1).subtract(1, 'd').format('YYYY-MM-DD')
	while (cache.includes(q2)) {
		q2 = dayjs(q2).subtract(1, 'd').format('YYYY-MM-DD')
	}
	if (str.includes('10日区间')) {
		let index = 1
		if (str.includes('今日') && !str.includes('昨日')) {
			let start = ''
			while (index < 10) {
				start = dayjs(start ? start : reStr)
					.subtract(1, 'd')
					.format('YYYY-MM-DD')
				if (!cache.includes(start)) {
					index++
				}
			}
			str = str.replace('10日区间', `${start}到${reStr}`)
		}
		if (str.includes('昨日')) {
			let start = ''
			while (index < 10) {
				start = dayjs(start ? start : q1)
					.subtract(1, 'd')
					.format('YYYY-MM-DD')
				if (!cache.includes(start)) {
					index++
					// console.log(index, start)
				}
			}
			str = str.replace('10日区间', `${start}到${q1}`)
		}
	}
	return str
		.replace(/\今日/g, reStr ? reStr : '今日')
		.replace(/\昨日/g, q1 ? q1 : '昨日')
		.replace(/\前日/g, q2 ? q2 : '前日')
}
export function getStartDate(end: string, range: number) {
	if (!end || !range) {
		console.error('params is error')
		return dayjs().format('YYYY-MM-DD')
	}
	const y = end.split('-')[0]
	let cache = Cache.get('holiday', y)
	if (!cache) {
		console.error('cache not find')
		cache = []
	}
	let start = ''
	let index = 1
	while (index < range) {
		start = dayjs(start ? start : end)
			.subtract(1, 'd')
			.format('YYYY-MM-DD')
		if (!cache.includes(start)) {
			index++
		}
	}
	return start
}
export function resolutionWenCaiData(data: any) {
	let res = null
	if (data) {
		try {
			const extra =
				data.data.answer[0].txt[0].content.components[0].data.meta.extra
			const datas = data.data.answer[0].txt[0].content.components[0].data.datas
			const iwc_column_info = extra.iwc_column_info
			const indexID = Object.keys(iwc_column_info)
			let codeIndex: string, // 股票代码
				nameIndex: string, // 股票简称
				lxztsIndex: string, // 连续涨停天数
				ztyylbIndex: string, // 涨停原因类别
				jtjbIndex: string // 几天几板
			indexID.forEach((item) => {
				if (item === '股票代码') {
					codeIndex = item
				}
				if (item === '股票简称') {
					nameIndex = item
				}
				if (item.includes('连续涨停天数[')) {
					lxztsIndex = item
				}
				if (item.includes('涨停原因类别[')) {
					ztyylbIndex = item
				}
				if (item.includes('几天几板[')) {
					jtjbIndex = item
				}
			})
			const ztyylbMap = new Map()
			datas.forEach((item: any) => {
				const code = item[codeIndex] || 'code'
				const name = item[nameIndex] || 'name'
				const lxzts = item[lxztsIndex] ? Number(item[lxztsIndex]) : 0
				const ztyylb = item[ztyylbIndex] || ''
				const ztyylbArray = ztyylb.split('+')
				let jtjb = item[jtjbIndex] || ''
				jtjb = jtjb.indexOf('首板') !== -1 ? '首板' : jtjb
				if (jtjb === '首板' && lxzts > 1) {
					// 修正数据
					jtjb = `${lxzts}天${lxzts}板`
				}
				let sortField = 1
				if (jtjb !== '首板') {
					sortField = jtjb.match(/(?<=\天)(.+?)(?=\板)/g)[0]
				}
				const newItem = {
					code,
					name,
					lxzts,
					ztyylb,
					jtjb,
					sortField,
				}
				ztyylbArray.forEach((lb: string) => {
					const has = ztyylbMap.get(lb)
					if (has) {
						has.push(newItem)
					} else {
						ztyylbMap.set(lb, [newItem])
					}
				})
			})
			const lbs: string[] = []
			const ztyylbs = Array.from(ztyylbMap)
				.sort((a, b) => {
					return b[1].length - a[1].length
				})
				.map((item) => {
					item[1] = item[1].sort((a: any, b: any) => {
						return b.sortField - a.sortField
					})
					lbs.push(item[0])
					return {
						lb: item[0],
						num: item[1].length,
						stocks: item[1],
					}
				})
			res = {
				lbs,
				data: ztyylbs,
			}
		} catch (error) {
			console.error(error)
			res = false as any
		}
	}
	return res
}
export function resolutionThemes(data: any, date: Dayjs) {
	let res: any[] = []
	if (data) {
		const hotMap = new Map()
		data.forEach((item: any) => {
			item.hot.forEach((h: any) => {
				let vol = 0
				if (item.date === date.format('YYYY-MM-DD')) {
					vol = h.vol
				}
				const has = hotMap.get(h.name)
				if (has) {
					has.totalVol += h.vol
					has.num += 1
					if (vol) {
						has.vol = vol
					}
				} else {
					hotMap.set(h.name, {
						name: h.name,
						totalVol: h.vol,
						average: 0,
						num: 1,
						vol,
					})
				}
			})
		})
		res = Array.from(hotMap)
			.map((item) => {
				const info = item[1]
				info.average = Number((info.totalVol / info.num).toFixed(0))
				return info
			})
			.sort((a, b) => {
				return b.average - a.average
			})
		// const themeMap = new Map()
		// data.forEach((item: any) => {
		// 	item.lbs.forEach((lb: string) => {
		// 		const has = themeMap.get(lb)
		// 		if (has) {
		// 			has.num += 1
		// 			has.info.push({
		// 				date: item.date,
		// 				stocks: item.data.find((d: any) => d.lb === lb).stocks,
		// 			})
		// 		} else {
		// 			themeMap.set(lb, {
		// 				num: 1,
		// 				info: [
		// 					{
		// 						date: item.date,
		// 						stocks: item.data.find((d: any) => d.lb === lb).stocks,
		// 					},
		// 				],
		// 			})
		// 		}
		// 	})
		// })
		// res = Array.from(themeMap)
		// 	.sort((a: any, b: any) => {
		// 		return b[1].num - a[1].num
		// 	})
		// 	.map((item) => {
		// 		const lastD = item[1].info[0].date
		// 		const diff = date.diff(dayjs(lastD), 'd')
		// 		let total = 0
		// 		item[1].info.forEach((info: any) => {
		// 			const dif = date.diff(dayjs(info.date), 'd')
		// 			if (dif < 14) {
		// 				total += info.stocks.length
		// 			}
		// 		})
		// 		let sortField = 0
		// 		if (date.format('YYYY-MM-DD') === item[1].info[0].date) {
		// 			sortField = item[1].info[0].stocks[0].sortField
		// 		}
		// 		return {
		// 			lb: item[0],
		// 			num: item[1].num,
		// 			info: item[1].info,
		// 			diff,
		// 			total,
		// 			sortField,
		// 		}
		// 	})
		// 	.sort((a, b) => {
		// 		return b.sortField - a.sortField
		// 	})
	}
	// console.log(res)

	return res
}
export function resolutionTrendStocksCycle(data: any) {
	// console.log(data)
	const pjz = getCustomPJZ(data)
	const dates: string[] = []
	const zhiShuScore: number[] = []
	const profitScore: number[] = []
	const lossScore: number[] = []
	data.forEach((item: any) => {
		dates.push(item.date)
		const ps = setCustomScore(item.zhishu.profit, pjz['profit'])
		const ls = setCustomScore(item.zhishu.loss, pjz['loss'])
		item.score = ps - ls
		zhiShuScore.push(item.score)
		profitScore.push(ps)
		lossScore.push(ls)
	})
	return {
		dates,
		zhiShuScore,
		profitScore,
		lossScore,
	}
}
export function resolutionTrendGnsCycle(data: any, currentDate: string) {
	const gnMap = new Map()
	const dates: string[] = []
	data.forEach((item: any) => {
		const date = item.date
		dates.push(date)
		const gnList = item.gnlists
		gnList.forEach((gn: any) => {
			if (gn.zhishu) {
				gn.date = date
				const has = gnMap.get(gn.label)
				if (has) {
					has.num += 1
					has.list.push(gn)
				} else {
					gnMap.set(gn.label, {
						label: gn.label,
						num: 1,
						score: 0,
						list: [gn],
					})
				}
			}
		})
	})
	const gns = Array.from(gnMap)
		.map((item) => {
			const list = item[1].list
			const pjz = getCustomPJZ(list)
			const zhiShuScore: number[] = []
			const profitScore: number[] = []
			const lossScore: number[] = []
			let score: number = 0
			let profit: number = 0
			let loss: number = 0
			const gndate: string[] = []
			dates.forEach((d) => {
				const gn = list.find((l: any) => l.date === d)
				if (gn) {
					const ps = setCustomScore(gn.zhishu.profit, pjz['profit'])
					const ls = setCustomScore(gn.zhishu.loss, pjz['loss'])
					gn.score = ps - ls
					zhiShuScore.push(gn.score)
					profitScore.push(ps)
					lossScore.push(ls)
					gndate.push(gn.date)
					if (gn.date === currentDate) {
						score = gn.score
						profit = ps
						loss = ls
					}
				} else {
					zhiShuScore.push(0)
					profitScore.push(0)
					lossScore.push(0)
				}
			})
			return {
				label: item[1].label,
				num: item[1].num,
				zhiShuScore,
				profitScore,
				lossScore,
				list,
				score,
				profit,
				loss,
				gndate,
			}
		})
		.sort((a, b) => {
			return b.score - a.score
		})
	// console.log(gns)

	return gns
}
function setCustomScore(data: any, pjz: any) {
	let tScore = 0
	Object.keys(data).forEach((key) => {
		const p = pjz[key]
		if (!data.pjz) {
			data.pjz = {}
		}
		data.pjz[key] = p
		const value = data[key]
		if (value > p) {
			tScore += 10
		}
		if (value < p) {
			tScore -= 10
		}
	})
	return tScore
}
function getCustomPJZ(data: any) {
	const res: any = {
		profit: {},
		loss: {},
	}
	data.forEach((item: any) => {
		const { profit, loss } = item.zhishu
		Object.keys(profit!).forEach((key) => {
			if (!res.profit[key]) {
				res.profit[key] = 0
			}
			res.profit[key] += profit[key]
		})
		Object.keys(loss!).forEach((key) => {
			if (!res.loss[key]) {
				res.loss[key] = 0
			}
			res.loss[key] += loss[key]
		})
	})
	// console.log('total', res)
	const pjz: any = {}
	Object.keys(res).forEach((key) => {
		if (!pjz[key]) {
			pjz[key] = {}
		}
		Object.keys(res[key]).forEach((subkey) => {
			pjz[key][subkey] = Number((res[key][subkey] / data.length).toFixed(2))
		})
	})
	// console.log('pjz', pjz, data.length)
	return pjz
}
export function resolutionEmotionZT(data: any) {
	let res = null
	if (data) {
		try {
			const extra =
				data.data.answer[0].txt[0].content.components[0].data.meta.extra
			const datas = data.data.answer[0].txt[0].content.components[0].data.datas
			const iwc_column_info = extra.iwc_column_info
			const indexID = Object.keys(iwc_column_info)
			let lxztsIndex: string, // 连续涨停天数
				jtjbIndex: string, // 几天几板
				zdfIndex: string // 涨跌幅
			indexID.forEach((item: any) => {
				if (item.includes('连续涨停天数[')) {
					lxztsIndex = item
				}
				if (item.includes('几天几板[')) {
					jtjbIndex = item
				}
				if (item.includes('涨跌幅:前复权[')) {
					zdfIndex = item
				}
			})
			const classify = {
				ztNum: datas.length, // 涨停数量
				lbNum: 0, // 连板数量
				firstNum: 0, // 首板数量
				fbNum: 0, // 反包板数量
				first: {
					hpNum: 0,
					lpNum: 0,
					z5Num: 0,
					d5Num: 0,
					jjNum: 0,
					zrhpb: 0,
					zrlpb: 0,
					zrz5b: 0,
					zrd5b: 0,
					zrjjl: 0,
				},
				lb: {
					hpNum: 0,
					lpNum: 0,
					z5Num: 0,
					d5Num: 0,
					jjNum: 0,
					zrhpb: 0,
					zrlpb: 0,
					zrz5b: 0,
					zrd5b: 0,
					zrjjl: 0,
					height: 1,
				},
				fb: {
					hpNum: 0,
					lpNum: 0,
					z5Num: 0,
					d5Num: 0,
					jjNum: 0,
					zrhpb: 0,
					zrlpb: 0,
					zrz5b: 0,
					zrd5b: 0,
					zrjjl: 0,
				},
			}
			datas.forEach((item: any) => {
				const lxzts = item[lxztsIndex] ? Number(item[lxztsIndex]) : 0
				const zdf = item[zdfIndex] ? Number(item[zdfIndex]) : 0
				let jtjb = item[jtjbIndex] || ''
				jtjb = jtjb.indexOf('首板') !== -1 ? '首板' : jtjb
				if (jtjb === '首板' && lxzts > 1) {
					// 修正数据
					jtjb = `${lxzts}天${lxzts}板`
				}
				if (lxzts > classify.lb.height) {
					classify.lb.height = lxzts
				}
				if (jtjb === '首板') {
					classify.firstNum += 1
					if (zdf > 0) {
						classify.first.hpNum += 1
					}
					if (zdf < 0) {
						classify.first.lpNum += 1
					}
					if (zdf >= 5) {
						classify.first.z5Num += 1
					}
					if (zdf <= -5) {
						classify.first.d5Num += 1
					}
					if (zdf > 9.8) {
						classify.first.jjNum += 1
					}
				} else if (lxzts > 1) {
					classify.lbNum += 1
					if (zdf > 0) {
						classify.lb.hpNum += 1
					}
					if (zdf < 0) {
						classify.lb.lpNum += 1
					}
					if (zdf >= 5) {
						classify.lb.z5Num += 1
					}
					if (zdf <= -5) {
						classify.lb.d5Num += 1
					}
					if (zdf > 9.8) {
						classify.lb.jjNum += 1
					}
				} else {
					classify.fbNum += 1
					if (zdf > 0) {
						classify.fb.hpNum += 1
					}
					if (zdf < 0) {
						classify.fb.lpNum += 1
					}
					if (zdf >= 5) {
						classify.fb.z5Num += 1
					}
					if (zdf <= -5) {
						classify.fb.d5Num += 1
					}
					if (zdf > 9.8) {
						classify.fb.jjNum += 1
					}
				}
			})
			classify.first.zrhpb = Number(
				(classify.first.hpNum / classify.firstNum).toFixed(2)
			)
			classify.first.zrlpb = Number(
				(classify.first.lpNum / classify.firstNum).toFixed(2)
			)
			classify.first.zrz5b = Number(
				(classify.first.z5Num / classify.firstNum).toFixed(2)
			)
			classify.first.zrd5b = Number(
				(classify.first.d5Num / classify.firstNum).toFixed(2)
			)
			classify.first.zrjjl = Number(
				(classify.first.jjNum / classify.firstNum).toFixed(2)
			)
			classify.lb.zrhpb = Number(
				(classify.lb.hpNum / classify.lbNum).toFixed(2)
			)
			classify.lb.zrlpb = Number(
				(classify.lb.lpNum / classify.lbNum).toFixed(2)
			)
			classify.lb.zrz5b = Number(
				(classify.lb.z5Num / classify.lbNum).toFixed(2)
			)
			classify.lb.zrd5b = Number(
				(classify.lb.d5Num / classify.lbNum).toFixed(2)
			)
			classify.lb.zrjjl = Number(
				(classify.lb.jjNum / classify.lbNum).toFixed(2)
			)
			classify.fb.zrhpb = Number(
				(classify.fb.hpNum / classify.fbNum).toFixed(2)
			)
			classify.fb.zrlpb = Number(
				(classify.fb.lpNum / classify.fbNum).toFixed(2)
			)
			classify.fb.zrd5b = Number(
				(classify.fb.d5Num / classify.fbNum).toFixed(2)
			)
			classify.fb.zrz5b = Number(
				(classify.fb.z5Num / classify.fbNum).toFixed(2)
			)
			classify.fb.zrjjl = Number(
				(classify.fb.jjNum / classify.fbNum).toFixed(2)
			)
			res = classify
		} catch (error) {
			console.error(error)
			res = false as any
		}
	}
	return res
}
export function resolutionEmotionDT(data: any) {
	let res = null
	if (data) {
		try {
			const extra =
				data.data.answer[0].txt[0].content.components[0].data.meta.extra
			const datas = data.data.answer[0].txt[0].content.components[0].data.datas
			const iwc_column_info = extra.iwc_column_info
			const indexID = Object.keys(iwc_column_info)
			let lxdtsIndex: string // 连续跌停天数
			indexID.forEach((item: any) => {
				if (item.includes('连续跌停天数[')) {
					lxdtsIndex = item
				}
			})
			const classify = {
				dtNum: datas.length, // 跌停数量
				ltNum: 0, // 连停数量
				height: 1,
			}
			datas.forEach((item: any) => {
				const lxdts = item[lxdtsIndex] || 0
				if (lxdts > 1) {
					if (lxdts > classify.height) {
						classify.height = lxdts
					}
					classify.ltNum += 1
				}
			})
			res = classify
		} catch (error) {
			console.error(error)
			res = false as any
		}
	}
	return res
}
export function resolutionEmotionDB(data: any) {
	let res = null
	if (data) {
		try {
			const extra =
				data.data.answer[0].txt[0].content.components[0].data.meta.extra
			const datas = data.data.answer[0].txt[0].content.components[0].data.datas
			const iwc_column_info = extra.iwc_column_info
			const indexID = Object.keys(iwc_column_info)
			let zdfIndex: string // 涨跌幅
			indexID.forEach((item: any) => {
				if (item.includes('涨跌幅:前复权[')) {
					zdfIndex = item
				}
			})
			const classify = {
				dbNum: datas.length, // 断板的数量
				hpNum: 0,
				z5Num: 0,
				fbNum: 0,
				lpNum: 0,
				d5Num: 0,
				hpb: 0,
				z5b: 0,
				fbl: 0,
				lpb: 0,
				d5b: 0,
			}
			datas.forEach((item: any) => {
				const zdf = item[zdfIndex] || 0
				if (zdf > 0) {
					classify.hpNum += 1
				}
				if (zdf < 0) {
					classify.lpNum += 1
				}
				if (zdf >= 5) {
					classify.z5Num += 1
				}
				if (zdf <= -5) {
					classify.d5Num += 1
				}
				if (zdf > 9.8) {
					classify.fbNum += 1
				}
			})
			classify.hpb = Number((classify.hpNum / classify.dbNum).toFixed(2))
			classify.lpb = Number((classify.lpNum / classify.dbNum).toFixed(2))
			classify.z5b = Number((classify.z5Num / classify.dbNum).toFixed(2))
			classify.d5b = Number((classify.d5Num / classify.dbNum).toFixed(2))
			classify.fbl = Number((classify.fbNum / classify.dbNum).toFixed(2))
			res = classify
		} catch (error) {
			console.error(error)
			res = false as any
		}
	}
	return res
}
export function resolutionEmotionSC(data: any) {
	let res = null
	if (data) {
		try {
			const extra =
				data.data.answer[0].txt[0].content.components[0].data.meta.extra
			res = extra.row_count || extra.code_count
		} catch (error) {
			console.error(error)
			res = false as any
		}
	}
	return res
}
export function resolutionEmotion(data: any[]) {
	data.forEach((item: SingleZhiShu) => {
		item.profit!.first!.zrhp = item.profitEffect?.first?.zrhpb!
		item.profit!.first!.zrjj = item.profitEffect?.first?.zrjjl!
		item.profit!.first!.zrz5 = item.profitEffect?.first?.zrz5b!
		item.loss!.first!.zrd5 = item.lossEffect?.first?.zrd5b!
		item.loss!.first!.zrlp = item.lossEffect?.first?.zrlpb!

		item.profit!.lb!.zrhp = item.profitEffect?.lb?.zrhpb!
		item.profit!.lb!.zrjj = item.profitEffect?.lb?.zrjjl!
		item.profit!.lb!.zrz5 = item.profitEffect?.lb?.zrz5b!
		item.loss!.lb!.zrd5 = item.lossEffect?.lb?.zrd5b!
		item.loss!.lb!.zrlp = item.lossEffect?.lb?.zrlpb!

		item.profit!.fb!.zrhp = item.profitEffect?.fb?.zrhpb!
		item.profit!.fb!.zrjj = item.profitEffect?.fb?.zrjjl!
		item.profit!.fb!.zrz5 = item.profitEffect?.fb?.zrz5b!
		item.loss!.fb!.zrd5 = item.lossEffect?.fb?.zrd5b!
		item.loss!.fb!.zrlp = item.lossEffect?.fb?.zrlpb!

		item.profit!.db!.hp = item.profitEffect?.db?.hpb!
		item.profit!.db!.fb = item.profitEffect?.db?.fbl!
		item.profit!.db!.z5 = item.profitEffect?.db?.z5b!
		item.loss!.db!.d5 = item.lossEffect?.db?.d5b!
		item.loss!.db!.lp = item.lossEffect?.db?.lpb!
	})
	console.log('源数据：', data)
	let res = null
	const total = getTotal(data)
	const pjz: any = getPJZ(total)
	const dates: string[] = []
	const qqzs: number[] = []
	const profitzs: number[] = []
	const losszs: number[] = []
	const lbzs: {
		profit: any[]
		loss: any[]
		data: any[]
	} = {
		profit: [],
		loss: [],
		data: [],
	}
	const firstZs: {
		profit: any[]
		loss: any[]
		data: any[]
	} = {
		profit: [],
		loss: [],
		data: [],
	}
	const dbzs: {
		profit: any[]
		loss: any[]
		data: any[]
	} = {
		profit: [],
		loss: [],
		data: [],
	}
	const fbzs: {
		profit: any[]
		loss: any[]
		data: any[]
	} = {
		profit: [],
		loss: [],
		data: [],
	}
	const sczs: {
		profit: any[]
		loss: any[]
		data: any[]
	} = {
		profit: [],
		loss: [],
		data: [],
	}
	const lbH: any[] = []
	const ltH: any[] = []
	const hot: any[] = []
	const scare: any[] = []
	data.forEach((item: SingleZhiShu) => {
		hot.push(item.today?.ztNum)
		scare.push(item.today?.d5Num)
		dates.push(item.date!)
		const profit = item.profit
		const loss = item.loss
		const ps = setScore(profit, pjz.profit, total.lenMap, 'profit')
		const ls = setScore(loss, pjz.loss, total.lenMap, 'loss')
		item.score = ps - ls
		profitzs.push(ps)
		losszs.push(ls)
		qqzs.push(item.score)
		lbzs.profit.push(profit?.lb?.score)
		lbzs.loss.push(loss?.lb?.score)
		lbzs.data.push((profit?.lb?.score as any) - (loss?.lb?.score as any))
		firstZs.profit.push(profit?.first?.score)
		firstZs.loss.push(loss?.first?.score)
		firstZs.data.push(
			(profit?.first?.score as any) - (loss?.first?.score as any)
		)
		dbzs.profit.push(profit?.db?.score)
		dbzs.loss.push(loss?.db?.score)
		dbzs.data.push((profit?.db?.score as any) - (loss?.db?.score as any))
		fbzs.profit.push(profit?.fb?.score)
		fbzs.loss.push(loss?.fb?.score)
		fbzs.data.push((profit?.fb?.score as any) - (loss?.fb?.score as any))
		sczs.profit.push(profit?.sc?.score)
		sczs.loss.push(loss?.sc?.score)
		sczs.data.push((profit?.sc?.score as any) - (loss?.sc?.score as any))
		lbH.push(profit?.sc?.lbHeight)
		ltH.push(loss?.sc?.ltHeight)
	})
	res = {
		dates,
		qqzs,
		profitzs,
		losszs,
		data,
		lbH,
		ltH,
		lbzs,
		firstZs,
		fbzs,
		dbzs,
		sczs,
		hot,
		scare,
	}
	return res
}

function setScore(data: any, pjz: any, lenMap: any, type: 'profit' | 'loss') {
	let tScore = 0
	// const totalLen = lenMap.sc
	Object.keys(data).forEach((key) => {
		if (key === 'sc' || key === 'lb' || key === 'first') {
			const itemPjz = pjz[key]
			if (itemPjz) {
				const item = data[key]
				let score = 0
				// const len = lenMap[key]
				if (Object.prototype.toString.call(item) === '[object Object]') {
					Object.keys(item).forEach((key1) => {
						if (!['diffRate', 'score', 'ltHeight', 'lbHeight'].includes(key1)) {
							const p = itemPjz[key1]
							if (p) {
								if (!item.pjz) {
									item.pjz = {}
								}
								item.pjz[key1] = p
								const value = item[key1]
								if (value !== null) {
									if (value > p) {
										// if (type === 'profit') {
										score += 10
										// } else {
										// score -= 10
										// }
									}
									if (value < p) {
										// if (type === 'profit') {
										score -= 10
										// } else {
										// score += 10
										// }
									}
								}
							}
						}
					})
					let diffRate = 1
					switch (key) {
						case 'first':
						case 'lb':
						// case 'fb':
						// 	diffRate = type === 'profit' ? 1 : 2
						// 	break
						// case 'db':
						// 	diffRate = 1.33
						// 	break
						case 'sc':
							diffRate = 1
							break
					}
					item.score = Number((score * (diffRate || 1)).toFixed(0))
					// // item.score = score
					// console.log(score, diffRate, item.score, key, type)
				}
				tScore += item.score
			}
		}
	})
	data.score = tScore
	return tScore
}

function getTotal(data: SingleZhiShu[]) {
	const res: any = {
		profit: {},
		loss: {},
		lenMap: {},
	}
	data.forEach((item: any) => {
		const { profit, loss } = item
		Object.keys(profit!).forEach((key) => {
			if (!res.profit[key]) {
				res.profit[key] = {}
			}
			if (key !== 'db') {
				const num = profit[key].num
				if (!res.lenMap[key]) {
					res.lenMap[key] = 1
				} else {
					if (num) {
						res.lenMap[key] += 1
					} else if (key === 'sc') {
						res.lenMap[key] += 1
					}
					// res.lenMap[key] += 1
				}
			}
			Object.keys(profit[key]).forEach((subKey) => {
				if (!res.profit[key][subKey]) {
					res.profit[key][subKey] = 0
				}
				res.profit[key][subKey] += profit[key][subKey]
			})
		})
		Object.keys(loss!).forEach((key) => {
			if (!res.loss[key]) {
				res.loss[key] = {}
			}
			if (key === 'db') {
				const num = loss[key].num
				if (!res.lenMap[key]) {
					res.lenMap[key] = 1
				} else if (num) {
					res.lenMap[key] += 1
				}
				// } else {
				// 	res.lenMap[key] += 1
				// }
			}
			Object.keys(loss[key]).forEach((subKey) => {
				if (!res.loss[key][subKey]) {
					res.loss[key][subKey] = 0
				}
				res.loss[key][subKey] += loss[key][subKey]
			})
		})
	})
	console.log('total', res)
	return res
}
function getPJZ(total: any) {
	const res = {}
	getObj(
		{
			profit: total.profit,
			loss: total.loss,
		},
		res
	)
	function getObj(obj: any, res: any, len?: number) {
		Object.keys(obj).forEach((key) => {
			if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
				res[key] = {}
				getObj(obj[key], res[key], total.lenMap[key])
			} else {
				res[key] = Number((obj[key] / len!).toFixed(2))
			}
		})
	}
	// console.log(res)
	return res
}
export function extend(def: any, obj: any) {
	const res = JSON.parse(JSON.stringify(def))
	function getObj(def1: any, obj1: any) {
		Object.keys(obj1).forEach((key) => {
			if (!def1[key]) {
				def1[key] = obj1[key]
			} else {
				if (
					Object.prototype.toString.call(def1[key]) !==
					Object.prototype.toString.call(obj1[key])
				) {
					def1[key] = obj1[key]
				} else if (
					Object.prototype.toString.call(obj1[key]) === '[object Object]'
				) {
					getObj(def1[key], obj1[key])
				} else if (
					Object.prototype.toString.call(obj1[key]) === '[object Array]'
				) {
					if (!obj1[key].length) {
						def1[key] = obj1[key]
					} else {
						obj1[key].forEach((item: any, i: number) => {
							if (!def1[key][i]) {
								def1[key][i] = item
							} else {
								if (
									Object.prototype.toString.call(item) === '[object Object]'
								) {
									getObj(def1[key][i], item)
								} else {
									def1[key][i] = item
								}
							}
						})
					}
				} else {
					def1[key] = obj1[key]
				}
			}
		})
	}
	getObj(res, obj)
	return res
}
export function resolutionTrend(data: any) {
	let res = null
	if (data) {
		try {
			const extra =
				data.data.answer[0].txt[0].content.components[0].data.meta.extra
			const datas = data.data.answer[0].txt[0].content.components[0].data.datas
			const iwc_column_info = extra.iwc_column_info
			const indexID = Object.keys(iwc_column_info)
			let nameIndex: string,
				codeIndex: string,
				qjzdfIndex: string, // 区间涨跌幅
				zdfIndex: string,
				sclxIndex: string, // 市场类型
				gnIndex: string // 概念
			indexID.forEach((item: any) => {
				if (item.includes('股票简称')) {
					nameIndex = item
				}
				if (item.includes('股票代码')) {
					codeIndex = item
				}
				if (item.indexOf('涨跌幅:前复权[') > 0) {
					qjzdfIndex = item
				}
				if (item === '所属概念') {
					gnIndex = item
				}
				if (item.indexOf('涨跌幅:前复权[') === 0) {
					zdfIndex = item
				}
				if (item.includes('股票市场类型')) {
					sclxIndex = item
				}
			})
			const stocks: any = []
			const gnMap = new Map()
			datas.forEach((item: any, i: number) => {
				const name = item[nameIndex]
				const code = item[codeIndex]
				const qjzdf = Number(Number(item[qjzdfIndex]).toFixed(2))
				const zdf = Number(Number(item[zdfIndex]).toFixed(2))
				const gns = item[gnIndex]
				const sclxs = item[sclxIndex]
				let sclx = '主板'
				if (sclxs.includes('创业')) {
					sclx = '创业板'
				}
				if (sclxs.includes('科创')) {
					sclx = '科创板'
				}
				if (sclxs.includes('北证')) {
					sclx = '北交所'
				}
				const stock = {
					ranking: i + 1,
					change: 0,
					nameAndCode: `${name}(${code})`,
					name,
					code,
					qjzdf,
					gns: gns ? gns : [],
					sclx,
					zdf,
				}
				const gnList: string[] = []
				gns &&
					gns.split(';').forEach((gn: string) => {
						if (
							![
								'转融券标的',
								'融资融券',
								'深股通',
								'富时罗素概念股',
								'标普道琼斯A股',
								'富时罗素概念',
								'沪股通',
							].includes(gn)
						) {
							gnList.push(gn)
							stock.gns = gnList
							const has = gnMap.get(gn)
							if (has) {
								has.stocks.push(stock.code)
								has.num += 1
							} else {
								gnMap.set(gn, {
									label: gn,
									num: 1,
									change: 0,
									stocks: [stock.code],
								})
							}
						}
					})
				stocks.push(stock)
			})
			stocks.forEach((stock: any) => {
				if (Object.prototype.toString.call(stock.gns) !== '[object Array]') {
					stock.gns = []
				}
				const gnArray: any[] = []
				stock.gns.forEach((gn: string) => {
					const gnInfo = gnMap.get(gn)
					if (gnInfo.num > 2) {
						gnArray.push({
							label: gnInfo.label,
							num: gnInfo.num,
						})
					}
				})
				stock.gns = gnArray.sort((a, b) => {
					return b.num - a.num
				})
			})
			const gnlists = Array.from(gnMap)
				.filter((gn) => {
					return gn[1].num > 2
				})
				.sort((a, b) => {
					return b[1].num - a[1].num
				})
				.map((gn, i) => {
					// console.log(gn)
					gn[1].ranking = i + 1
					return gn[1]
				})
			res = {
				stocks,
				gnlists,
			}
			console.log(res)
		} catch (error) {
			console.error(error)
			res = false as any
		}
	}
	return res
}
export function resolutionTrendData(trendData: {
	today: {
		gnlists: any[]
		stocks: any[]
	}
	yesterday: {
		gnlists: any[]
		stocks: any[]
	}
}) {
	const TStocks = trendData.today.stocks
	const YStocks = trendData.yesterday.stocks
	if (TStocks && YStocks) {
		TStocks.forEach((stock) => {
			const code = stock.code
			const yStock = YStocks.find((s) => s.code === code)
			if (yStock) {
				stock.change = yStock.ranking - stock.ranking
			} else {
				stock.change = TStocks.length + 1
			}
		})
		const zhishu = {
			score: 0,
			hp: 0,
			lp: 0,
			z5: 0,
			d5: 0,
			z9_8: 0,
			d9_8: 0,
			profit: {
				hpb: 0,
				z5b: 0,
				z9_8b: 0,
			},
			loss: {
				lpb: 0,
				d5b: 0,
				d9_8b: 0,
			},
		}
		const len = YStocks.length
		YStocks.forEach((stock) => {
			const zdf = stock.zdf
			if (zdf > 0) {
				zhishu.hp += 1
				if (zdf > 5) {
					zhishu.z5 += 1
				}
				if (zdf > 9.8) {
					zhishu.z9_8 += 1
				}
			}
			if (zdf < 0) {
				zhishu.lp += 1
				if (zdf < -5) {
					zhishu.d5 += 1
				}
				if (zdf < -9.8) {
					zhishu.d9_8 += 1
				}
			}
		})
		zhishu.profit.hpb = Number((zhishu.hp / len).toFixed(2))
		zhishu.profit.z5b = Number((zhishu.z5 / len).toFixed(2))
		zhishu.profit.z9_8b = Number((zhishu.z9_8 / len).toFixed(2))
		zhishu.loss.lpb = Number((zhishu.lp / len).toFixed(2))
		zhishu.loss.d5b = Number((zhishu.d5 / len).toFixed(2))
		zhishu.loss.d9_8b = Number((zhishu.d9_8 / len).toFixed(2))
		;(trendData.today as any).zhishu = zhishu
	}
	const TGns = trendData.today.gnlists
	const YGns = trendData.yesterday.gnlists
	if (TGns && YGns) {
		TGns.forEach((gn) => {
			const label = gn.label
			const yGn = YGns.find((g) => g.label === label)
			if (yGn) {
				gn.change = yGn.ranking - gn.ranking
			} else {
				gn.change = TGns.length + 1
			}
		})
		YGns.forEach((gn) => {
			const zhishu = {
				score: 0,
				hp: 0,
				lp: 0,
				z5: 0,
				d5: 0,
				z9_8: 0,
				d9_8: 0,
				profit: {
					hpb: 0,
					z5b: 0,
					z9_8b: 0,
				},
				loss: {
					lpb: 0,
					d5b: 0,
					d9_8b: 0,
				},
			}
			const len = gn.stocks.length
			gn.stocks.forEach((code: any) => {
				const stock = YStocks.find((s) => s.code === code)
				const zdf = stock.zdf
				if (zdf > 0) {
					zhishu.hp += 1
					if (zdf > 5) {
						zhishu.z5 += 1
					}
					if (zdf > 9.8) {
						zhishu.z9_8 += 1
					}
				}
				if (zdf < 0) {
					zhishu.lp += 1
					if (zdf < -5) {
						zhishu.d5 += 1
					}
					if (zdf < -9.8) {
						zhishu.d9_8 += 1
					}
				}
			})
			zhishu.profit.hpb = Number((zhishu.hp / len).toFixed(2))
			zhishu.profit.z5b = Number((zhishu.z5 / len).toFixed(2))
			zhishu.profit.z9_8b = Number((zhishu.z9_8 / len).toFixed(2))
			zhishu.loss.lpb = Number((zhishu.lp / len).toFixed(2))
			zhishu.loss.d5b = Number((zhishu.d5 / len).toFixed(2))
			zhishu.loss.d9_8b = Number((zhishu.d9_8 / len).toFixed(2))
			gn.zhishu = zhishu
			const tGn = TGns.find((g) => g.label === gn.label)
			if (tGn) {
				tGn.zhishu = zhishu
			}
		})
	}
	return trendData
}
export function SetHoliday() {
	const y = dayjs().format('YYYY')
	const cache = Cache.get('holiday', y)
	if (!cache) {
		GetHoliday(y).then((res) => {
			if (res.data.code === 0) {
				const rawHoliday = res.data.holiday
				const hday: string[] = []
				Object.keys(rawHoliday).forEach((key) => {
					const d = rawHoliday[key]
					hday.push(d.date)
				})
				Cache.set('holiday', y, hday)
			}
		})
	}
}
