import data from './trade.json';
import tradeIn from './tradein';

$(document).ready(function() {
    // let param = 'subtime';
    
    // if (param) {
    //     data.result.forEach((v,i) => {
    //         if (param === 'subtime') i === 7 ? v.default = 'O' : '';
    //     });
    // }

    const tradIn = new tradeIn('.tradein_container', data);
});