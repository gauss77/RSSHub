import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { parseDate } from '@/utils/parse-date';

const PAGE = 1;
const PAGE_SIZE = 20;

export const route: Route = {
    path: '/developer/column',
    categories: ['social-media', 'programming'],
    example: '/tencent-cloud/developer/column',
    parameters: { categoryId: '专栏Id: categoryId == classifyId(api)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cloud.tencent.com/developer/column', 'cloud.tencent.com/developer/column?categoryId=:categoryId'],
        },
    ],
    name: '腾讯云开发者社区专栏',
    maintainers: ['lyling'],
    handler: async (ctx) => {
        const categoryId = ctx.req.param('categoryId');
        const link = `https://cloud.tencent.com/developer/api/home/article-list`;
        const response = await ofetch(link, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classifiId: categoryId,
                page: PAGE,
                pagesize: PAGE_SIZE,
                type: '',
            }),
        });

        const items = response.list.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章链接
            link: `https://cloud.tencent.com/developer/article/${item.articleId}`,
            // 文章正文
            description: item.summary,
            // 文章发布日期
            pubDate: parseDate(item.createTime * 1000),
            // 如果有的话，文章作者
            author: item.author.nickname,
            // 如果有的话，文章分类
            category: item.tags.map((tag) => tag.tagName),
        }));

        const title = `腾讯云开发者社区`;
        const description = '专栏';

        return {
            title,
            description,
            item: items,
        };
    },
};
