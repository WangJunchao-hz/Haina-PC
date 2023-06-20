import http from '@/common/utils/initAxios'
import Qs from 'qs'
export function GetHoliday(date: string) {
	const url =
		import.meta.env.MODE === 'development'
			? '/holiday'
			: '//timor.tech/api/holiday/year'
	return http.get(`${url}/${date}?type=Y&week=Y`)
}
export function GetKaiPanLaHotBanKuai(d) {
	const url =
		import.meta.env.MODE === 'development'
			? '/kaipanla'
			: '//apphis.longhuvip.com'
	return http.post(
		`${url}/w1/api/index.php`,
		Qs.stringify({
			Order: 1,
			st: 30,
			a: 'RealRankingInfo',
			c: 'ZhiShuRanking',
			PhoneOSNew: 1,
			DeviceID: '53a3eb38-6ddd-331d-8459-edeadbce743f',
			VerSion: '5.10.0.2',
			Index: 0,
			Date: d,
			apiv: 'w33',
			Type: 1,
			ZSType: 7,
		}),
		{
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
		}
	)
}
