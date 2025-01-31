const config = require('./config.json');
const cheerio = require('cheerio');
const { request } = require('undici');

let wikidotAuth = null;

const { QuickDB, JSONDriver } = require('quick.db');
const jsonDriver = new JSONDriver();
const db = new QuickDB({ driver: jsonDriver });

async function fetchLatestPage() {
    await request(`http://${config.siteName}.wikidot.com/feed/pages/pagename/most-recently-created/category/_default%2Cadult/tags/-admin/rating/%3E%3D-10/order/created_at+desc/limit/30/t/Most+Recently+Created`, {
        headers: {
            'Cache-Control': 'max-age=0',
            'Cookie': wikidotAuth,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
        }
    }).then(async res => {
        if (res.statusCode != 200) return console.error(`Wikidot error: Status code ${res.statusCode}`);
        if (res.headers['x-wikidot-static-cache'] != 'BYPASS') console.warn(`Warning: Not bypassing Wikidot static cache (x-wikidot-static-cache=${res.headers['x-wikidot-static-cache']})`);
        try {
            const Parser = require('rss-parser');
            const parser = new Parser({
                customFields: {
                    item: ['description']
                }
            });
            await parser.parseString(await res.body.text()).then(async feed => {
                let newPage = feed.items[0];
                if (newPage.link == db.get('latestPage')) return;

                db.set('latestPage', newPage.link);

                let $ = cheerio.load(newPage.description);

                const payload = {
                    content: null,
                    embeds: [
                        {
                            title: newPage.title,
                            description: `Đăng lúc: <t:${Math.floor(new Date(newPage.isoDate).getTime() / 1000)}:F>\nBởi người dùng: [${$('p > span > a:nth-child(2)').text()}](${$('body > p > span > a:nth-child(2)').attr('href')})`,
                            url: newPage.link,
                            color: 5814783,
                            author: {
                                name: 'Bài mới trên Wiki SCP-VN'
                            }
                        }
                    ],
                    attachments: []
                };
                /*

                try {
                    const response = await request(config.webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.statusCode != 204) {
                        console.error(`Failed to send message. Status: ${response.statusCode}`);
                    }
                } catch (error) {
                    console.error('Error sending message to Discord:', error);
                }
                    */
            });
        } catch (err) {
            console.error(err);
        }
    });
    setTimeout(fetchLatestPage, 5000);
}

// login to bypass wikidot cache
async function loginToWikidot() {
    const wikidotToken7 = Math.random().toString(36).substring(4);
    const [username, password] = config.wdLogin.split(':');
    try {
        const response = await request('https://www.wikidot.com/default--flow/login__LoginPopupScreen', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
                'Cookie': `wikidot_token7=${wikidotToken7}`,
            },
            body: `login=${username}&password=${encodeURIComponent(password)}&action=Login2Action&event=login`
        });

        if ((await response.body.text()).includes('The login and password do not match.')) throw new Error('Invalid Wikidot username or password.');

        wikidotAuth = `${response.headers['set-cookie'].split('; ')[0]}; wikidot_token7=${wikidotToken7}`;
        console.log('Successfully logged in to Wikidot. Monitoring new articles');
    } catch (err) {
        throw new Error(err);
    }
    setTimeout(fetchLatestPage, 1000);
}

loginToWikidot();