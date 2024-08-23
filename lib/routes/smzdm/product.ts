import { Route, DataItem } from '@/types';
import { ofetch } from 'ofetch';
import { load } from 'cheerio';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/product/:id',
    categories: ['shopping'],
    example: '/smzdm/product/zm5vzpe',
    parameters: { id: '商品 id，网址上直接可以看到' },
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
            source: ['wiki.smzdm.com/p/:id'],
            target: '/product/:id',
        },
    ],
    name: '商品',
    maintainers: ['chesha1'],
    handler,
};

async function handler(ctx) {
    const link = `https://wiki.smzdm.com/p/${ctx.req.param('id')}`;

    const response = await ofetch(link);
    const $ = load(response);
    const title = $('title').text();

    // get simple info from list
    const items: DataItem[] = $('ul#feed-main-list li')
        .map(function () {
            const altText = $(this).find('img').attr('alt');
            const link = $(this).find('h5.feed-block-title a').attr('href');
            const price = $(this).find('.z-highlight').text();
            const title = altText + ' ' + price;
            const description = $(this).find('.feed-block-descripe').text().replaceAll(/\s+/g, '');

            return {
                title,
                link,
                description,
            };
        })
        .toArray();

    // get detail info from each item
    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                // filter outdated articles
                if ($('span.old').length > 0) {
                    return null;
                } else {
                    const pubDate = $('meta[name="weibo:webpage:create_at"]').attr('content');
                    item.pubDate = pubDate;

                    if (item.description === '阅读全文') {
                        item.description = $('p[itemprop="description"]').first().html() as string;
                    }

                    return item;
                }
            })
        )
    );

    const filteredOut = out.filter((result) => result !== null);

    return {
        title,
        link,
        item: filteredOut,
    };
}
