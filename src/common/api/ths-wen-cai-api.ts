import http from '@/common/utils/initAxios'
import wencaitools from '@/common/utils/wencaitools'
export function GetRobotData(params: {
	question: string
	page?: number
	perpage?: number
	secondary_intent?: string
}) {
	const url =
		import.meta.env.MODE === 'development' ? '/wencai' : '//www.iwencai.com'
	return http.post(
		`${url}/customized/chart/get-robot-data?time=${new Date().getTime()}`,
		{
			page: 1,
			perpage: 200,
			secondary_intent: 'stock',
			source: 'Ths_iwencai_Xuangu',
			version: '2.0',
			rsh: "Ths_iwencai_Xuangu_0t6e1du1frevbe2av8rl1ao9euofwp53",
			time: new Date().getTime(),
			...params,
		},
		{
			headers: {
				'Hexin-V': (wencaitools.rt as any).update(),
			},
		}
	)
}
