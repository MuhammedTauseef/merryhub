export interface WishCategory {
  slug: string;
  title: string;
  heading: string;
  metaDescription: string;
  intro: string;
  wishes: string[];
}

export const WISH_CATEGORIES: WishCategory[] = [
  {
    slug: "for-family",
    title: "Christmas Wishes for Family",
    heading: "Christmas Wishes for Family",
    metaDescription:
      "Heartfelt Christmas wishes for family — for parents, siblings, grandparents and the whole crew. Copy a wish or turn it into a shareable Christmas card, free.",
    intro:
      "Family is the heart of Christmas. These original wishes are written for the people who know you best — warm, grateful and easy to send as they are, or to place on a card with our free card maker.",
    wishes: [
      "Merry Christmas to the people who make every ordinary day feel like home. Thank you for the laughter, the patience and the love that never runs out.",
      "However far apart we are this year, you are in every song, every light and every bite of Christmas dinner. Merry Christmas, family — I love you more than words.",
      "To the best family anyone could ask for: may your Christmas be full of full plates, long hugs and the kind of stories we will still be telling next December.",
      "Merry Christmas, Mum and Dad. Everything good in my life started at your table. Wishing you a day as warm and generous as you have always been to us.",
      "Having you as my family is the gift I never have to unwrap. Merry Christmas — may this season give back to you even a little of what you give all year.",
      "Merry Christmas to my favourite people on the planet. May the house be loud, the food be plenty and the love be louder than both.",
      "For every ride, every rescue, every Sunday call and every second helping — thank you. Merry Christmas to the family that shows up, every single time.",
      "Wishing my wonderful family a Christmas wrapped in health, sprinkled with laughter and tied together with love. You deserve all of it.",
      "Merry Christmas, Grandma and Grandpa. Your stories, your cooking and your hugs are the traditions I treasure most. May your day be gentle and joyful.",
      "To my siblings — partners in crime since childhood and my favourite people as an adult. Merry Christmas! Same time, same chaos, next year?",
      "Christmas at home would not be Christmas without you. Thank you for being my soft place to land. Wishing you the merriest of days.",
      "May our family be blessed with another year of health, humour and togetherness. Merry Christmas to each and every one of you — near, far, and forever in my heart.",
    ],
  },
  {
    slug: "for-friends",
    title: "Christmas Wishes for Friends",
    heading: "Christmas Wishes for Friends",
    metaDescription:
      "Christmas wishes for friends — warm, cheerful messages for best friends, old friends and new ones. Copy one in a tap or make a free Christmas card with it.",
    intro:
      "Friends are the family we choose, and Christmas is the perfect excuse to tell them so. Pick a wish below for your best friend, your group chat or that friend you have known forever.",
    wishes: [
      "Merry Christmas to my favourite human. Life is better, funnier and warmer with you in it — here is to another year of adventures together.",
      "You are not just my friend, you are my emergency contact for life. Merry Christmas! May your season be as kind and generous as you are.",
      "Merry Christmas! Thank you for every laugh, every late-night talk and every time you showed up exactly when I needed you. You are a gift all year round.",
      "To the friend who feels like family: may your Christmas be merry, your cocoa be hot and your worries be small. Love you lots.",
      "Distance means so little when friendship means so much. Sending you the biggest Christmas hug across the miles — merry Christmas, my friend.",
      "Merry Christmas to the one who knows all my stories and still sits at my table. May your holidays sparkle as much as your friendship does.",
      "Friends like you make the season bright. Wishing you a Christmas full of good food, great company and absolutely no washing up.",
      "Another year, another Christmas, same wonderful you. Thank you for being the constant in my chaos. Merry Christmas!",
      "May your Christmas be filled with people who love you, moments that warm you and mince pies that never run out. You deserve the very best, friend.",
      "Merry Christmas! If I could wrap up what your friendship means to me, there would not be enough paper in the world. Have a magical one.",
      "To my partner in every plan and every plot twist: merry Christmas. Next year, let us make even better stories.",
      "Wishing you a Christmas as wonderful as the day I met you — which, for the record, was one of my life's best gifts. Merry Christmas, friend.",
    ],
  },
  {
    slug: "for-boss",
    title: "Christmas Wishes for Your Boss",
    heading: "Christmas Wishes for Your Boss",
    metaDescription:
      "Christmas wishes for your boss or manager — respectful, appreciative and professionally warm. Copy one for a card or message, or make a festive card with it.",
    intro:
      "A message to your boss should be warm, brief and genuine — thankful without gushing. These wishes are written exactly for that balance, whether it's for a card on their desk or a message to the whole leadership team.",
    wishes: [
      "Merry Christmas and thank you for your leadership this year. Wishing you and your family a restful holiday and a successful New Year.",
      "Season's greetings! Your support and clear direction made a real difference to my year. Wishing you a peaceful Christmas and a bright New Year.",
      "Wishing you a very Merry Christmas. Thank you for the guidance, trust and opportunities this year — I look forward to what we build together next.",
      "Merry Christmas! I hope the break gives you the rest you've earned after a demanding year. Best wishes to you and your family.",
      "Thank you for leading by example and for every word of encouragement this year. Merry Christmas to you and yours.",
      "Merry Christmas! Your encouragement and fairness make this a great place to work. Hope the season returns some of that kindness to you.",
      "Wishing you a joyful Christmas surrounded by the people who matter most, and a New Year full of the results your hard work deserves.",
      "Season's greetings, and thank you for a year of honest feedback and real opportunities to grow. Have a wonderful Christmas.",
      "Merry Christmas to a manager who makes big goals feel achievable. Enjoy a well-earned rest — see you in the New Year.",
      "May your Christmas be calm, your table be full and your January be kind. Thank you for an excellent year of working together.",
      "Warm wishes for Christmas and the New Year. I'm grateful to be part of a team led with such clarity and good humour.",
      "Merry Christmas! Here's to another year of ambitious plans and the leadership that turns them into results.",
    ],
  },
  {
    slug: "for-coworkers",
    title: "Christmas Wishes for Coworkers",
    heading: "Christmas Wishes for Coworkers & Colleagues",
    metaDescription:
      "Christmas wishes for coworkers and colleagues — friendly, professional messages for teammates, work friends and the whole office. Copy one or make a card.",
    intro:
      "Coworkers see us through deadlines, launches and Monday mornings — they deserve a proper thank-you at Christmas. These wishes are friendly and workplace-safe, for teammates close and colleagues across the office.",
    wishes: [
      "Merry Christmas to a wonderful colleague. Your hard work and good humour made this year a success — enjoy a well-earned break with the people you love.",
      "Thank you for being such a supportive teammate. Working alongside you has been one of the highlights of my year. Merry Christmas!",
      "Happy holidays! May your inbox stay quiet, your days be restful and your Christmas be filled with family, food and laughter.",
      "Merry Christmas! Thanks for every deadline rescued, every coffee shared and every laugh in between. See you in the New Year.",
      "Season's greetings to you and your family. May the holidays recharge you for another great year together.",
      "Merry Christmas! May your holidays be long, your meetings be few and your January be gentle.",
      "To the coworker who makes Mondays bearable: merry Christmas! Hope your break is everything you've been counting down to.",
      "Warmest wishes for Christmas and the New Year. Grateful for a great year of working together — same again next year?",
      "Merry Christmas! May your festive season involve zero spreadsheets and an unreasonable amount of good food.",
      "Thank you for covering, collaborating and keeping me sane this year. Wishing you the merriest of Christmases.",
      "Season's greetings! Working with you turned big projects into good memories. Enjoy every minute of the break.",
      "Merry Christmas to a brilliant teammate. May Santa bring you rest, joy and absolutely no urgent emails.",
    ],
  },
  {
    slug: "for-clients",
    title: "Christmas Wishes for Clients",
    heading: "Christmas Wishes for Clients & Business Partners",
    metaDescription:
      "Professional Christmas wishes for clients and business partners — grateful, polished messages a business can send with confidence. Copy one or make a card.",
    intro:
      "A client Christmas message is a small thing that carries real weight: gratitude, professionalism and a warm start to next year's relationship. These wishes are written for businesses to send to clients and partners, polished and sincere.",
    wishes: [
      "Merry Christmas and thank you for your business this year. Working with you has been a genuine pleasure — wishing you and your team a joyful season.",
      "Season's greetings! We're grateful for the trust you've placed in us this year and look forward to serving you even better in the New Year.",
      "Wishing you a Merry Christmas filled with rest and celebration, and a New Year of growth and good fortune.",
      "Thank you for choosing us this year. Clients like you are the reason we love what we do. Merry Christmas to you and your whole team.",
      "Warm wishes for the festive season. May your Christmas be peaceful and your New Year prosperous in every way.",
      "Merry Christmas! We appreciate your partnership more than a card can say — here's to another successful year together.",
      "From all of us to all of you: thank you for a wonderful year. May your holidays be bright and your January be brilliant.",
      "Season's greetings and sincere thanks for your continued support. Wishing you health, happiness and success this Christmas and beyond.",
      "Merry Christmas! It's been a privilege to work with you this year. We hope the season brings you the break you've earned.",
      "May your Christmas be merry and your New Year be your best year yet. Thank you for being part of our story this year.",
      "Wishing you and your loved ones a joyful festive season. Thank you for your loyalty — we never take it for granted.",
      "Merry Christmas! Here's to good business, great people and another year of both. With gratitude from our whole team.",
    ],
  },
  {
    slug: "for-teacher",
    title: "Christmas Wishes for Teachers",
    heading: "Christmas Wishes for Teachers",
    metaDescription:
      "Christmas wishes for teachers — grateful messages from students and parents for the people who teach, encourage and inspire all year. Copy one or make a card.",
    intro:
      "Teachers give the gift of learning all year; Christmas is our turn to give a little back. These wishes are written for students and parents to send to the teachers who made a difference this year.",
    wishes: [
      "Merry Christmas to a wonderful teacher. Thank you for every lesson, every patience-filled explanation and every bit of encouragement this year.",
      "You give the gift of learning all year round — we hope Christmas gives some of that kindness back to you. Merry Christmas!",
      "Merry Christmas! Thank you for believing in your students even on the days they make it difficult. Enjoy a restful, joyful break.",
      "To the teacher who turns hard topics into 'oh, I get it now!' — wishing you a Christmas as bright as the futures you're building.",
      "Season's greetings! May your holidays be free of marking, full of mince pies and rich with the rest you've earned.",
      "Merry Christmas, and thank you for making the classroom a place where questions are welcome and nobody is left behind.",
      "A great teacher is a gift that lasts a lifetime. Thank you for being one. Wishing you and your family a magical Christmas.",
      "Merry Christmas! Your kindness at the school gate and your energy in the classroom never go unnoticed. Have a wonderful holiday.",
      "Thank you for every early morning, every stayed-late afternoon and every word of encouragement. Merry Christmas to an exceptional teacher.",
      "Wishing you a Christmas filled with the same joy you bring into class every day. See you in the New Year, refreshed and ready.",
      "Merry Christmas! May your break be long, your cocoa be hot and your January class be as delightful as you deserve.",
      "From our family to yours: thank you for teaching with your heart. Merry Christmas and a happy, healthy New Year.",
    ],
  },
  {
    slug: "funny",
    title: "Funny Christmas Wishes",
    heading: "Funny Christmas Wishes",
    metaDescription:
      "Funny Christmas wishes and messages that land — light-hearted lines for friends, family and coworkers. Copy one or put it on a card for an instant laugh.",
    intro:
      "Not every Christmas message has to be misty-eyed. These funny wishes keep it festive and friendly — perfect for friends, siblings, coworkers and anyone who appreciates a good groan with their greetings.",
    wishes: [
      "Merry Christmas! May your gifts be great, your relatives be brief and your leftovers last longer than the family group chat debate.",
      "I hope Santa is good to you this year. I put in a good word — mostly because I need you in a good mood when I ask for favours in January.",
      "Merry Christmas! Remember, calories do not count in December. That is not science, but it is absolutely the rule we are living by.",
      "May your Christmas be less 'assembling furniture at midnight' and more 'feet up, film on, snacks within reach'. You have earned it.",
      "Merry Christmas from someone who was going to get you an amazing present, but then remembered you prefer the gift of my company. You are welcome.",
      "Wishing you a Christmas as bright as your tree and twice as well put together. Mine is held up by hope and one suspicious branch.",
      "Merry Christmas! May your wrapping be neat, your tape be findable and your scissors not vanish the moment you sit down.",
      "Santa called — he says you have been 'mostly good', which honestly is the best review any of us can hope for. Merry Christmas!",
      "May your holidays be filled with joy, love and relatives who know when the party is over. Merry Christmas, you magnificent human.",
      "Merry Christmas! I would tell you what I got you, but the delivery driver and I are currently in a committed relationship built on suspense.",
      "Here is to a Christmas where the gravy is smooth, the board games stay friendly and nobody brings up politics before dessert.",
      "Merry Christmas! Eat the cake. Wear the pyjamas all day. Answer no emails. This is my official festive advice.",
    ],
  },
  {
    slug: "short-and-sweet",
    title: "Short & Sweet Christmas Wishes",
    heading: "Short & Sweet Christmas Wishes",
    metaDescription:
      "Short Christmas wishes and one-line Merry Christmas messages — perfect for cards, texts and captions. Sweet, simple and ready to copy.",
    intro:
      "Sometimes the shortest message says it best. These one and two-line wishes are made for gift tags, text messages, card corners and captions — brief, warm and ready to copy.",
    wishes: [
      "Merry Christmas! Wishing you love, light and laughter today and always.",
      "May your Christmas sparkle and your New Year shine. Warmest wishes to you.",
      "Peace, joy and hot cocoa — merry Christmas to you and yours.",
      "Wishing you a Christmas wrapped in happiness and tied with love.",
      "Merry Christmas! So grateful for you, today and every day.",
      "May your heart be light and your home be warm this Christmas.",
      "Sending you a sleigh-full of love this Christmas. Have a merry one!",
      "Joy to you and your family — merry Christmas and a happy New Year.",
      "Short message, big love: Merry Christmas!",
      "May the season fill your home with laughter and your heart with peace.",
      "Merry Christmas! Eat well, laugh often, love much.",
      "To you, with love, at Christmas and always. Have a beautiful day.",
    ],
  },
  {
    slug: "romantic",
    title: "Romantic Christmas Wishes",
    heading: "Romantic Christmas Wishes",
    metaDescription:
      "Romantic Christmas wishes for your partner, husband, wife, boyfriend or girlfriend — tender messages for the one you love most. Copy one or make a card.",
    intro:
      "Christmas is quietly one of the most romantic days of the year — soft lights, slow evenings and the person you love beside you. These wishes are written for partners and sweethearts, tender without being over the top.",
    wishes: [
      "Merry Christmas, my love. Every light on the tree reminds me how bright my life became the day you walked into it.",
      "All I want for Christmas is you — and luckily, I get you every day of the year. Merry Christmas to my favourite person in the world.",
      "Being loved by you is my favourite gift, and it never needs wrapping. Merry Christmas, darling. Here is to us, always.",
      "Merry Christmas to the one who makes winter warm. Your hand in mine is still my favourite place to be.",
      "Under the mistletoe or under a blanket watching old films — anywhere is magic as long as it is with you. Merry Christmas, love.",
      "You are my Christmas morning and my midnight wish, all in one person. Thank you for loving me the way you do. Merry Christmas.",
      "This year gave us a thousand little moments, and every one of them was better because of you. Merry Christmas, my heart.",
      "Merry Christmas, beautiful. May our next year be filled with slow dances in the kitchen, shared secrets and a love that only grows.",
      "Santa can skip my house this year — I already have everything I ever wished for, sleeping right beside me. Merry Christmas, my love.",
      "Your love is the warmest place I know. Wishing you a Christmas as gentle, joyful and wonderful as you make my life.",
      "Merry Christmas to my forever. Whatever the New Year brings, we face it the way we face everything: together.",
      "Kissing you under twinkling lights will never get old. Merry Christmas, sweetheart — I choose you, every year, every day.",
    ],
  },
  {
    slug: "religious",
    title: "Religious & Christian Christmas Wishes",
    heading: "Religious & Christian Christmas Wishes",
    metaDescription:
      "Christian Christmas wishes and religious messages celebrating the birth of Jesus — blessings, faith-filled greetings and prayers for family and friends.",
    intro:
      "For many, Christmas begins with a manger, a star and a promise kept. These religious wishes honour the birth of Christ with gratitude and hope — suitable for family, friends and church community.",
    wishes: [
      "Merry Christmas! May the birth of Jesus fill your home with peace that lasts long after the decorations come down.",
      "Rejoicing with you in the miracle of Christmas. May Christ's love be the greatest gift your family receives this year.",
      "For unto us a child is born. Wishing you a Christmas full of wonder, worship and the warmth of God's love.",
      "May the light that shone over Bethlehem shine in your heart all year long. Merry Christmas and God bless you.",
      "Merry Christmas! Grateful for the gift of a Saviour and for friends and family to celebrate Him with.",
      "May your Christmas be a quiet, joyful reflection of God's greatest gift to the world. Blessings to you and your family.",
      "Glory to God in the highest, and peace to you this Christmas. May faith, hope and love fill your home.",
      "Wishing you a blessed Christmas. May the story of that holy night remind us all how deeply we are loved.",
      "Merry Christmas! May Jesus be at the centre of your celebrations and His peace in every corner of your home.",
      "As we celebrate the birth of Christ, I thank God for you. May the New Year draw you closer to Him and to everyone you love.",
      "May the hope of Christmas morning carry you through every season ahead. God bless you and keep you, today and always.",
      "Joy to the world, the Lord has come! Wishing you and your family a Christmas overflowing with gratitude and grace.",
    ],
  },
  {
    slug: "for-kids",
    title: "Christmas Wishes for Kids",
    heading: "Christmas Wishes for Kids",
    metaDescription:
      "Christmas wishes for kids — magical, playful messages from Santa, parents, grandparents and family friends that children will love. Copy or make a card.",
    intro:
      "Christmas through a child's eyes is pure magic — early mornings, rustling wrapping paper and very important questions about reindeer. These wishes are written for children: simple, joyful and full of wonder.",
    wishes: [
      "Merry Christmas, superstar! Santa told us you have been extra kind this year. May your day be full of surprises, sweets and happy squeals.",
      "Ho ho ho! Merry Christmas to one of Santa's favourite kids. The reindeer are ready, the sleigh is packed and something special has your name on it.",
      "Merry Christmas! May your day sparkle brighter than the star on top of the tree — and may your stocking be stuffed with wonderful things.",
      "To a very special kid: may your Christmas be filled with new toys, yummy treats and so much playing that bedtime has to be negotiated.",
      "Merry Christmas, little one. Thank you for the drawings, the giggles and the honest reviews of everyone's cooking. You make Christmas magical.",
      "Santa's elves have been busy, the snow is falling and magic is in the air. Merry Christmas — this is your day to shine!",
      "Wishing you a Christmas as amazing as you are: full of games, stories, hot chocolate with extra marshmallows and people who adore you.",
      "Merry Christmas! Remember to leave out a snack for Santa and a carrot for the reindeer — they are working very hard tonight, just for kids like you.",
      "You are on the nice list — we checked twice. Merry Christmas to a kind, clever and completely wonderful kid.",
      "May your Christmas morning start early, your batteries be included and your joy last all year long. Merry Christmas!",
      "Merry Christmas to our favourite little elf. Your smile is the best decoration our home could ever have.",
      "Rudolph says hello and Santa says Merry Christmas! Be good, dream big and enjoy every magical minute of your day.",
    ],
  },
  {
    slug: "in-spanish",
    title: "Christmas Wishes in Spanish",
    heading: "Christmas Wishes in Spanish (¡Feliz Navidad!)",
    metaDescription:
      "Christmas wishes in Spanish — original Feliz Navidad messages for family, friends and loved ones far away. Copy one or make a free Christmas card with it.",
    intro:
      "¡Feliz Navidad! Whether your Christmas means Nochebuena with the whole family, a video call across the ocean or a quiet evening of gratitude, these original Spanish wishes are ready to copy, send and share — or to place on a card with our free card maker.",
    wishes: [
      "¡Feliz Navidad! Que tu hogar se llene de amor, risas y momentos inolvidables junto a las personas que más quieres.",
      "Te deseo una Navidad llena de paz y un Año Nuevo repleto de sueños cumplidos. ¡Felices fiestas!",
      "Que la luz de la Navidad ilumine tu camino hoy y durante todo el año que viene. ¡Feliz Navidad!",
      "Feliz Navidad a la distancia: aunque estemos lejos, te llevo en mi corazón en estas fiestas y siempre.",
      "Que el mejor regalo de esta Navidad sea el tiempo compartido con la familia. ¡Felices fiestas!",
      "¡Feliz Navidad! Que no te falten motivos para sonreír, abrazos que aprieten fuerte y mesas llenas de cariño.",
      "En estas fiestas te deseo salud, amor y mucha alegría. Gracias por ser parte de mi vida. ¡Feliz Navidad!",
      "Que el espíritu de la Navidad renueve tu esperanza y llene tus días de bendiciones. ¡Feliz Navidad y próspero Año Nuevo!",
      "Feliz Navidad, amigo mío. Que el año que viene nos regale más momentos juntos y menos kilómetros de por medio.",
      "Que cada luz del árbol te recuerde lo mucho que te queremos. ¡Muy feliz Navidad para ti y tu familia!",
      "Te mando un abrazo enorme envuelto en papel de Navidad. ¡Que pases unas fiestas maravillosas!",
      "Feliz Navidad: que el amor sea el ingrediente principal de tu cena, de tu casa y de todo tu año.",
    ],
  },
  {
    slug: "in-portuguese",
    title: "Christmas Wishes in Portuguese",
    heading: "Christmas Wishes in Portuguese (Feliz Natal!)",
    metaDescription:
      "Christmas wishes in Portuguese — original Feliz Natal messages for family, friends and loved ones near and far. Copy one or make a free Christmas card with it.",
    intro:
      "Feliz Natal! From a table full of family on Christmas Eve to a video call with someone you love on the other side of the ocean, these original Portuguese wishes are ready to copy, send and share — or to place on a card with our free card maker.",
    wishes: [
      "Feliz Natal! Que a sua casa se encha de amor, risadas e momentos inesquecíveis ao lado de quem você mais ama.",
      "Desejo a você um Natal de muita paz e um Ano Novo cheio de sonhos realizados. Boas festas!",
      "Que a luz do Natal ilumine o seu caminho hoje e em todos os dias do ano que vem. Feliz Natal!",
      "Feliz Natal, mesmo de longe: a distância separa os abraços, mas nunca os corações. Você está sempre no meu pensamento.",
      "Que o melhor presente deste Natal seja o tempo junto da família. Boas festas para você e para os seus!",
      "Feliz Natal! Que não faltem motivos para sorrir, abraços apertados e uma mesa cheia de carinho.",
      "Neste Natal, desejo saúde, amor e muita alegria para você. Obrigado por fazer parte da minha vida. Feliz Natal!",
      "Que o espírito do Natal renove a sua esperança e encha os seus dias de bênçãos. Feliz Natal e um próspero Ano Novo!",
      "Feliz Natal, meu amigo! Que o próximo ano nos presenteie com mais encontros e menos quilômetros de distância.",
      "Que cada luz da árvore lembre a você o quanto é amado. Um Natal maravilhoso para você e toda a sua família!",
      "Envio um abraço enorme, embrulhado em papel de presente. Que as suas festas sejam lindas do começo ao fim!",
      "Feliz Natal: que o amor seja o ingrediente principal da sua ceia, da sua casa e de todo o seu ano.",
    ],
  },
];

export function getCategory(slug: string): WishCategory | undefined {
  return WISH_CATEGORIES.find((c) => c.slug === slug);
}
