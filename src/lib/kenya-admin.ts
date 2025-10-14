// Kenya administrative units (Counties and Subcounties)
// This is a curated list. You can expand or adjust names to match your data standards.
// Source references can include KNBS/CRA lists.

export const KENYA_COUNTIES: string[] = [
  'Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita-Taveta','Garissa','Wajir','Mandera','Marsabit','Isiolo','Meru','Tharaka-Nithi','Embu','Kitui','Machakos','Makueni','Nyandarua','Nyeri','Kirinyaga','Murang\'a','Kiambu','Turkana','West Pokot','Samburu','Trans Nzoia','Uasin Gishu','Elgeyo-Marakwet','Nandi','Baringo','Laikipia','Nakuru','Narok','Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma','Busia','Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira','Nairobi'
]

export const KENYA_SUBCOUNTIES: Record<string, string[]> = {
  'Nairobi': [
    'Westlands','Dagoretti North','Dagoretti South','Langata','Kibra','Roysambu','Kasarani','Ruaraka','Embakasi North','Embakasi East','Embakasi West','Embakasi Central','Embakasi South','Makadara','Kamukunji','Starehe','Mathare'
  ],
  'Kiambu': [
    'Ruiru','Thika Town','Juja','Gatundu North','Gatundu South','Githunguri','Kiambu Town','Lari','Limuru','Kabete','Kikuyu','Kiambaa'
  ],
  'Mombasa': [
    'Jomvu','Changamwe','Kisauni','Nyali','Likoni','Mvita'
  ],
  'Kisumu': [
    'Kisumu East','Kisumu West','Kisumu Central','Nyando','Muhoroni','Seme'
  ],
  'Nakuru': [
    'Nakuru Town East','Nakuru Town West','Naivasha','Gilgil','Subukia','Bahati','Rongai','Molo','Njoro','Kuresoi North','Kuresoi South'
  ],
  'Kakamega': [
    'Lurambi','Kakamega Central','Mumias East','Mumias West','Lugari','Likuyani','Navakholo','Malava','Butere','Khwisero','Matungu','Ikolomani','Shinyalu'
  ],
  'Kwale': ['Msambweni','Lungalunga','Matuga','Kinango'],
  'Kilifi': ['Kilifi North','Kilifi South','Kaloleni','Rabai','Ganze','Malindi','Magarini'],
  'Tana River': ['Bura','Galole','Garsen'],
  'Lamu': ['Lamu East','Lamu West'],
  'Taita-Taveta': ['Taveta','Wundanyi','Mwatate','Voi'],
  'Garissa': ['Garissa Township','Balambala','Lagdera','Dadaab','Fafi','Ijara'],
  'Wajir': ['Wajir East','Wajir West','Wajir North','Wajir South','Tarbaj','Eldas'],
  'Mandera': ['Mandera East','Mandera West','Mandera North','Mandera South','Banisa','Lafey'],
  'Marsabit': ['Moyale','North Horr','Saku','Laisamis'],
  'Isiolo': ['Isiolo','Garbatulla','Merti'],
  'Meru': ['Igembe South','Igembe Central','Igembe North','Tigania West','Tigania East','North Imenti','Central Imenti','South Imenti','Buuri East','Buuri West'],
  'Tharaka-Nithi': ['Tharaka North','Tharaka South','Maara','Chuka/Igambang\'ombe'],
  'Embu': ['Manyatta','Runyenjes','Mbeere North','Mbeere South'],
  'Kitui': ['Kitui Central','Kitui West','Kitui East','Kitui South','Kitui Rural','Mwingi Central','Mwingi West','Mwingi North'],
  'Machakos': ['Machakos Town','Kangundo','Matungulu','Mavoko','Athi River','Mwala','Yatta','Kathiani','Masinga'],
  'Makueni': ['Makueni','Kibwezi East','Kibwezi West','Kaiti','Kilome','Mbooni'],
  'Nyandarua': ['Kinangop','Kipipiri','Ol Kalou','Ol Jorok','Ndaragwa'],
  'Nyeri': ['Nyeri Town','Tetu','Kieni East','Kieni West','Mathira East','Mathira West','Othaya','Mukurwe-ini'],
  'Kirinyaga': ['Mwea East','Mwea West','Kirinyaga East','Kirinyaga West','Ndia','Gichugu'],
  "Murang'a": ['Kiharu','Kangema','Mathioya','Kigumo','Maragwa','Kandara','Gatanga'],
  'Turkana': ['Turkana Central','Turkana North','Turkana South','Turkana East','Loima','Kibish'],
  'West Pokot': ['Kapenguria','Sigor','Kacheliba','Pokot South'],
  'Samburu': ['Samburu East','Samburu North','Samburu West'],
  'Trans Nzoia': ['Cherangany','Kwanza','Endebess','Kiminini','Saboti'],
  'Uasin Gishu': ['Ainabkoi','Kapseret','Kesses','Moiben','Soy','Turbo'],
  'Elgeyo-Marakwet': ['Keiyo North','Keiyo South','Marakwet East','Marakwet West'],
  'Nandi': ['Aldai','Emgwen','Mosop','Nandi Hills','Tinderet','Chesumei'],
  'Baringo': ['Baringo Central','Baringo North','Baringo South','Mogotio','Eldama Ravine','Tiaty East','Tiaty West'],
  'Laikipia': ['Laikipia East','Laikipia West','Laikipia North'],
  'Narok': ['Narok North','Narok East','Narok South','Narok West','Emurua Dikirr','Kilgoris'],
  'Kajiado': ['Kajiado Central','Kajiado East','Kajiado North','Kajiado South','Kajiado West'],
  'Kericho': ['Ainamoi','Belgut','Buret','Kipkelion East','Kipkelion West','Sigowet/Soin'],
  'Bomet': ['Bomet East','Bomet Central','Chepalungu','Konoin','Sotik'],
  'Vihiga': ['Vihiga','Luanda','Emuhaya','Sabatia','Hamisi'],
  'Bungoma': ['Bumula','Kabuchai','Kanduyi','Kimilili','Mt Elgon','Sirisia','Tongaren','Webuye East','Webuye West'],
  'Busia': ['Bunyala','Butula','Funyula','Matayos','Nambale','Teso North','Teso South'],
  'Siaya': ['Alego Usonga','Bondo','Gem','Rarieda','Ugenya','Ugunja'],
  'Homa Bay': ['Homa Bay Town','Kabondo Kasipul','Kasipul','Karachuonyo','Ndhiwa','Mbita','Rangwe','Suba South'],
  'Migori': ['Awendo','Kuria East','Kuria West','Nyatike','Rongo','Suna East','Suna West','Uriri'],
  'Kisii': ['Bonchari','Bomachoge Borabu','Bomachoge Chache','Kitutu Chache North','Kitutu Chache South','Nyaribari Chache','Nyaribari Masaba','South Mugirango'],
  'Nyamira': ['Borabu','Manga','Masaba North','North Mugirango','West Mugirango'],
}
