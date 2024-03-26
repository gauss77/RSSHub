import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async function fetch(slug: string) {
    const url = `https://go-api.twreporter.org/v2/posts/${slug}?full=true`;
    const res = await got(url);
    const post = res.data.data;

    const time = post.published_date;
    // For `writers`
    let authors = '';
    if (post.writers) {
        authors = post.writers.map((writer) => (writer.job_title ? writer.job_title + ' / ' + writer.name : '文字 / ' + writer.name)).join('，');
    }

    // For `photography`, if it exists
    let photographers = '';
    if (post.photographers) {
        photographers = post.photographers
            .map((photographer) => {
                let title = '攝影 / ';
                if (photographer.job_title) {
                    title = photographer.job_title + ' / ';
                }
                return title + photographer.name;
            })
            .join('，');
        authors += '；' + photographers;
    }

    const banner_image = post.og_image.resized_targets.desktop.url;
    const caption = post.leading_image_description;
    const banner_description = post.og_image.description;
    const og_description = post.og_description;
    const banner = art(path.join(__dirname, 'templates/image.art'), { image: banner_image, description: banner_description, caption });

    const text = post.content.api_data
        .map((item) => {
            const content = item.content;
            const type = item.type;
            let block = '';
            if (content !== '' && type !== 'embeddedcode') {
                switch (type) {
                    case 'image':
                    case 'slideshow':
                        block = content.map((image) => art(path.join(__dirname, 'templates/image.art'), { image: image.desktop.url, description: image.description, caption: image.description })).join('');

                        break;

                    case 'blockquote':
                        block = `<blockquote>${content}</blockquote>`;

                        break;

                    case 'header-one':
                        block = `<h1>${content}</h1>`;

                        break;

                    case 'header-two':
                        block = `<h2>${content}</h2>`;

                        break;

                    case 'infobox': {
                        const box = content[0];
                        block = `<h2>${box.title}</h2>${box.body}`;

                        break;
                    }
                    default:
                        block = `${item.content}<br>`;
                }
            }
            return block;
        })
        .join('<br>');
    const contents = [banner, og_description, text].join('<br><br>');

    return {
        author: authors,
        description: contents,
        link: `https://www.twreporter.org/a/${slug}`,
        guid: `https://www.twreporter.org/a/${slug}`,
        pubDate: parseDate(time, 'YYYY-MM-DDTHH:mm:ssZ'),
    };
}
