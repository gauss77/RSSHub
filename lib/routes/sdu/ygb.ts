import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://www.ygb.sdu.edu.cn/';

const typeMap = {
    zytz: {
        title: '重要通知',
        url: 'zytz.htm',
    },
    glfw: {
        title: '管理服务',
        url: 'glfw.htm',
    },
    cxsj: {
        title: '创新实践',
        url: 'cxsj.htm',
    },
};

export const route: Route = {
    path: '/ygb/:type?',
    categories: ['university'],
    example: '/sdu/ygb/zytz',
    parameters: { type: '默认为`zytz`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '山东大学研工部',
    maintainers: ['kukeya'],
    handler,
    description: `| 重要通知 | 管理服务 | 创新实践 | 
  | -------- | -------- |-------- |
  | zytz     | glfw     | cxsj    | `,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ? ctx.req.param('type') : 'zytz';
    const link = new URL(typeMap[type].url, host).href;

    const response = await got(link);

    const $ = load(response.data);

    let item = $('.zytz-list li')
        .map((_, e) => {
            e = $(e);
            const a = e.find('a');
            let link = '';
            link = a.attr('href').startsWith('info/') || a.attr('href').startsWith('content') ? host + a.attr('href') : a.attr('href');
            return {
                title: a.text().trim(),
                link,
                pubDate: parseDate(e.find('b').text().trim().slice(1, -1), 'YYYY-MM-DD'),
            };
        })
        .get();

    item = await Promise.all(
        item.map((item) =>
            cache.tryGet(item.link, async () => {
                if (new URL(item.link).hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                } else if (new URL(item.link).hostname !== 'www.ygb.sdu.edu.cn') {
                    return item;
                }
                const response = await got(item.link);
                const $ = load(response.data);

                item.title = $('.article-tlt').text().trim();
                $('.article-tlt').remove();
                item.description = $('form[name=_newscontent_fromname]').html();

                return item;
            })
        )
    );

    return {
        title: `山东大学研工部${typeMap[type].title}`,
        description: $('title').text(),
        link,
        item,
        icon: 'https://www.ygb.sdu.edu.cn/img/logo.png',
    };
}
