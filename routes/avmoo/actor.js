const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const baseUrl = 'https://avmoo.pw/cn';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `${baseUrl}/star/${id}`;

    const { data } = await axios(url);

    const $ = cheerio.load(data);

    const item = $('#waterfall .item')
        .map((index, el) => {
            if (index === 0) {
                return {
                    title: $(el)
                        .find('.photo-info span')
                        .text(),

                    link: url,

                    description: `<img referrerpolicy="no-referrer" src="${$(el)
                        .find('img')
                        .attr('src')}"><br>${$(el)
                        .find('.photo-info p')
                        .map((_, el) => $(el).text())
                        .get()
                        .slice(0, -1)
                        .join(';')}`,
                };
            }

            return {
                title: $(el)
                    .find('.photo-info date')
                    .first()
                    .text(),

                description: `${$(el)
                    .find('.photo-info span')
                    .contents()
                    .filter((_, el) => el.nodeType === 3)
                    .text()}<br><img referrerpolicy="no-referrer" src="${$(el)
                    .find('img')
                    .attr('src')}">`,

                pubDate: new Date(
                    $(el)
                        .find('.photo-info date')
                        .last()
                        .text()
                ).toUTCString(),

                link: `${baseUrl}/movie/${$(el)
                    .find('a')
                    .attr('href')
                    .split('/')
                    .pop()}`,
            };
        })
        .get();

    ctx.state.data = {
        ...item.shift(),

        item,
    };
};
