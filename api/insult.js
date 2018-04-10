const insults = [
    'fils de pute',
    'putain',
    'merde',
    'enculé',
    'enculer',
    'bougnoul',
    'abruti',
    'aller niquer sa mère',
    'aller se faire enculer',
    'aller se faire endauffer',
    'aller se faire foutre',
    'aller se faire mettre',
    'andouille',
    'appareilleuse',
    'assimilé',
    'astèque',
    'avorton',
    'emmanché',
    'emmerder',
    'emmerdeur',
    'emmerdeuse',
    'empafé',
    'empapaouté',
    'enculé',
    'enculé de ta race',
    'enculer',
    'enfant de putain',
    'enfant de pute',
    'enfant de salaud',
    'enflure',
    'enfoiré',
    'envaselineur',
    'épais',
    'espèce de',
    'espingoin',
    'étron',
    'bande d’abrutis',
    'bâtard',
    'bellicole',
    'bête',
    'bête à pleurer',
    'bête comme ses pieds',
    'bête comme un chou',
    'bête comme un cochon',
    'biatch',
    'bic',
    'bicot',
    'bite',
    'bitembois',
    'Bitembois',
    'bordille',
    'boudin',
    'bouffi',
    'bouffon',
    'bougnoul',
    'bougnoule',
    'Bougnoulie',
    'bougnoulisation',
    'bougnouliser',
    'bougre',
    'boukak',
    'boulet',
    'bounioul',
    'bounioule',
    'bourdille',
    'branleur',
    'bridé',
    'bridée',
    'brigand',
    'brise-burnes',
    'cacou',
    'cafre',
    'cageot',
    'caldoche',
    'casse-bonbon',
    'casse-couille',
    'casse-couilles',
    'cave',
    'chachar',
    'chagasse',
    'charlot de vogue',
    'chauffard',
    'chbeb',
    'chien de chrétien',
    'chiennasse',
    'chienne',
    'chier',
    'chinetoc',
    'chinetoque',
    'chintok',
    'chleuh',
    'chnoque',
    'citrouille',
    'coche',
    'colon',
    'con',
    'con comme la lune',
    'con comme ses pieds',
    'con comme un balai',
    'con comme un manche',
    'con comme une chaise',
    'con comme une valise sans poignée',
    'conasse',
    'conchier',
    'connard',
    'connarde',
    'connasse',
    'counifle',
    'courtaud',
    'CPF',
    'crétin',
    'crevure',
    'cricri',
    'crotté',
    'crouillat',
    'crouille',
    'croûton',
    'débile',
    'doryphore',
    'doxosophe',
    'doxosophie',
    'drouille',
    'du schnoc',
    'ducon',
    'duconnot',
    'dugenoux',
    'dugland',
    'duschnock',
    'face de chien',
    'face de pet',
    'face de rat',
    'FDP',
    'fell',
    'fils de bâtard',
    'fils de chien',
    'fils de chienne',
    'fils de garce',
    'fils de pute',
    'fils de ta race',
    'fiotte',
    'folle',
    'fouteur',
    'fripouille',
    'frisé',
    'fritz',
    'Fritz',
    'fumier',
    'garage à bite',
    'garce',
    'gaupe',
    'GDM',
    'gland',
    'glandeur',
    'glandeuse',
    'glandouillou',
    'glandu',
    'gnoul',
    'gnoule',
    'Godon',
    'gogol',
    'goï',
    'gouilland',
    'gouine',
    'gourde',
    'gourgandine',
    'grognasse',
    'gueniche',
    'guide de merde',
    'guindoule',
    'imbécile',
    'incapable',
    'lopette',
    'magot',
    'makoumé',
    'mal blanchi',
    'manche',
    'mange-merde',
    'mangeux de marde',
    'marchandot',
    'margouilliste',
    'marsouin',
    'mauviette',
    'melon',
    'merdaille',
    'merdaillon',
    'merde',
    'merdeux',
    'merdouillard',
    'michto',
    'minable',
    'minus',
    'misérable',
    'nique',
    'niquer',
    'niqué',
];

const insultDetector = (sentence) => {
    let is_insult = new RegExp(insults.join("|"), "i");
    let sentenceArray = sentence.split(" ");

    if(is_insult.test(sentence)) {
        insults.forEach((insult) => {
            let res = sentence.match(insult);

            if (res) {
                for(let i = 0; i < sentenceArray.length; i++) {
                    if(sentenceArray[i] === res[0]) {
                        const wordLength = sentenceArray[i].length;
                        let regex = new RegExp("(.{0," + (wordLength - 1) + "})$");

                        sentenceArray[i] = sentenceArray[i].replace(regex, "****");
                    }
                }
            }
        });

        sentenceArray = sentenceArray.join(' ');

        return sentenceArray;
    }

    return sentence;
};

module.exports.insultDetector = insultDetector;