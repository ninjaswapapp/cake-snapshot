const { default: axios } = require('axios');
const JSDom = require('jsdom').JSDOM;

async function parseHoldersPage(minDfx, page) {
    let result = [];

    return new Promise((resolve, reject) => {
        axios.get(`https://bscscan.com/token/generic-tokenholders2?a=0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82&p=${page}`).then(response => {
            const document = new JSDom(response.data).window.document;
            const table = document.querySelector("#maintable > div:nth-child(3) > table > tbody");

            for (let i = 0; i < table.childNodes.length; i++) {
                const node = table.childNodes[i];

                if (node.nodeType == node.TEXT_NODE)
                    continue;

                const quantity = Number(node.childNodes[2].textContent.replace(/,/g, ''));

                if (quantity < minDfx)
                    break;

                result.push({
                    rank: node.childNodes[0].textContent,
                    address: node.childNodes[1].firstChild.lastChild.href.split('=')[1],
                    quantity: quantity,
                    value: node.childNodes[4].textContent,
                    isContract: node.childNodes[1].firstChild.firstChild.nodeName === 'I'
                });
            }

            resolve(result);
        });
    });
}

(async () => {
    console.log(await parseHoldersPage(1,2));
})()