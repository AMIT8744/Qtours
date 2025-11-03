-- Add Italian description column to tours table
ALTER TABLE tours ADD COLUMN IF NOT EXISTS description_it TEXT;

-- Update all tours with their Italian descriptions from the original data

-- ABU DHABI XL
UPDATE tours SET description_it = 'Il nostro tour inizia con una pittoresca passeggiata sul lungomare di Abu Dhabi, noto come la Corniche, che ti regalerà una straordinaria vista sullo skyline della città. Qui faremo una breve pausa per catturare qualche scatto fotografico, prima di proseguire verso l''Heritage Village. Questo luogo è un affascinante ricostruzione di un villaggio che offre un''immersione nel passato, permettendoci di rivivere lo stile di vita del paese prima della scoperta del petrolio. 

Successivamente ci fermeremo per un''altra sessione fotografica all''Emirates Palace, un sontuoso hotel a 5 stelle originariamente concepito come residenza reale. Dopo di che faremo tappa alle Etihad Towers, cinque imponenti torri che rappresentano un''icona della città di Abu Dhabi.

La nostra prossima destinazione sarà la maestosa Grande Moschea dello Sceicco Zayed, conosciuta anche come la Moschea Bianca. Questo autentico capolavoro architettonico è considerato una delle più belle moschee al mondo e può ospitare fino a 40.000 fedeli. Ti ricordiamo che l''accesso è consentito solo con l''abbigliamento appropriato.

Si prosegue il tour verso l''isola di Yas, che è sede del Circuito di Formula 1 e di Ferrari World, qui faremo un foto stop e visiteremo il negozio dei gadget della Ferrari. L''ultima tappa del nostro tour sarà un foto-stop al Museo del Louvre, capolavoro architettonico dell''Archi-Star Jean Nouvel.

Tour in breve: La Corniche, Heritage Village, Emirates Palace, Ethiad Towers, Grande Moschea di Sheikh Zayed, Ferrari World, Museo del Louvre.

Nota: Per l''ingresso in moschea sono obbligatorie per le donne maniche lunghe e pantaloni lunghi con foulard in testa mentre per gli uomini pantaloni lunghi. L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'ABU DHABI XL';

-- DUBAI XL
UPDATE tours SET description_it = 'Avventurati alla scoperta di Dubai con un tour completo che ti porterà dai suoi scintillanti grattacieli alle storiche vie dei souq, per un''esperienza autentica e suggestiva. Iniziamo il viaggio a Dubai Marina, dove potrai ammirare gli imponenti grattacieli che simboleggiano la modernità e il lusso della città. 

Proseguiremo verso Palm Jumeirah, l''isola artificiale a forma di palma, dove si trovano le residenze di VIP e celebrità. Qui faremo una sosta fotografica all''Atlantis The Palm, uno degli hotel più iconici al mondo. Il tour continua con una visita esterna al leggendario Burj Al Arab, la famosa "Vela", seguita da una passeggiata nel suggestivo Souq Madinat Jumeirah, un luogo che ricrea l''atmosfera dei mercati tradizionali con boutique e negozi affacciati su canali d''acqua.

Percorrendo la Sheikh Zayed Road, il cuore pulsante della città, ci fermeremo per una sosta fotografica al Museo del Futuro e al maestoso Dubai Frame, la cornice dorata più grande del mondo, perfetta per uno scatto memorabile. Entriamo poi nel cuore storico di Dubai con una visita al quartiere di Bastakia, dove potrai esplorare le antiche case emiratine e immergerti nella storia della città.

Attraverseremo il Creek a bordo di un''Abra, la tradizionale barca di legno, per raggiungere i souq storici della città. Passeggerai tra il Souq dell''Oro, dove potrai ammirare il più grande anello d''oro del mondo, il Souq delle Spezie, con i suoi aromi esotici e il Souq dei Tessuti, tra stoffe pregiate e colorate.

Il tour si conclude nel vibrante Dubai Mall con una sosta fotografica davanti al Burj Khalifa, il grattacielo più alto del mondo. Avrai tempo per visitare l''acquario gigante e assistere allo spettacolo delle fontane danzanti, un magico connubio di acqua, musica e luci.

Tour in breve: Dubai Marina, The Point Atlantis, The Palm Jumeirah-Souk Madinat Jumeirah & Burj Al Arab, Quartiere storico Al Bastakiya & Al Fahidi Giro in Abra sul Dubai Creek Souk dell''Oro & delle Spezie, Sheikh Zayed Road Museo del Futuro Dubai Frame, Dubai Mall, Sosta fotografica Burj Khalifa, Fontane Danzanti.

Nota: L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DUBAI XL';

-- DUBAI BY NIGHT
UPDATE tours SET description_it = 'Vivi la magia di Dubai illuminata con un tour serale emozionante tra grattacieli spettacolari, isole artificiali, mercati tradizionali e luoghi iconici della città.

Il tour inizia al Souq Madinat Jumeirah, conosciuto come la "Piccola Venezia" di Dubai, un mix di tradizione e lusso con boutique, ristoranti e viste spettacolari sui canali. Qui potrai scattare foto con il Burj Al Arab sullo sfondo. Seguirà una visita ai mercati tradizionali: il Souq dell''Oro e delle Spezie dove avrai tempo per curiosare tra le bancarelle e acquistare souvenir.

Lungo il tragitto sulla Sheikh Zayed Road ammireremo il Museo del Futuro illuminato, un''icona architettonica e il Dubai Frame, che di notte brilla creando un suggestivo contrasto. Il tour prosegue al Dubai Mall, dove vedrai l''Acquario di Dubai dall''esterno, lo scenografico Burj Khalifa e avrai anche la possibilità di assistere allo spettacolo delle fontane danzanti.

Concluderemo il tour a Dubai Marina, dove potrai passeggiare lungo il canale e ammirare gli imponenti grattacieli, tra cui la Cayan Tower. Proseguiremo verso Palm Jumeirah per una sosta fotografica all''Atlantis The Palm e al Royal Atlantis prima del rientro in nave.

Tour in breve: Dubai Marina, The Point Atlantis, The Palm Jumeirah- & Burj Al Arab, Creek Souk dell''Oro & delle Spezie, Sheikh Zayed Road Museo del Futuro Dubai Frame, Dubai Mall, Fontane Danzanti, Sosta fotografica Burj Khalifa.

Nota: L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DUBAI BY NIGHT';

-- DUBAI MEZZA GIORNATA
UPDATE tours SET description_it = 'Scopri le meraviglie di Dubai con un tour esclusivo che ti porterà tra i luoghi più iconici di questa città straordinaria, dove il passato incontra il futuro. Accompagnato da una guida italiana esperta, vivrai un''esperienza autentica tra grattacieli imponenti, mercati storici e panorami mozzafiato.

Dubai Marina Walk: Passeggia lungo il suggestivo lungomare di Dubai Marina, circondato da grattacieli spettacolari e yacht di lusso. The Point & Atlantis: Ammira lo skyline dalla celebre The Point su Palm Jumeirah e scatta una foto indimenticabile con lo sfondo dell''iconico hotel Atlantis.

Souq Madinat Jumeirah & Burj Al Arab: Immergiti nell''atmosfera incantata del Souq Madinat, un bazar che fonde lusso e tradizione, prima di una sosta fotografica imperdibile davanti al Burj Al Arab (il leggendario hotel a forma di vela).

Quartiere storico Al Bastakiya & Al Fahidi: Passeggia tra i vicoli dell''antica Dubai, scoprendo la cultura e l''architettura tradizionale di questo affascinante quartiere. Giro in Abra sul Dubai Creek: Attraversa il Creek a bordo di un''Abra, la tipica barca in legno, per un''esperienza autentica che ti condurrà nei mercati più caratteristici della città.

Souq dell''Oro & delle Spezie: Lasciati avvolgere dai profumi e dai colori dei souq tradizionali: esplora il Souq delle Spezie e ammira i gioielli scintillanti del Souq dell''Oro, dove si trova il più grande anello d''oro del mondo.

Un viaggio tra passato e futuro per scoprire l''anima di Dubai in poche ore, con il comfort e la sicurezza di una guida italiana esperta. Dopo questo tour su richiesta possiamo lasciarvi al Dubai Mall.

Tour in breve: Dubai Marina, The Point Atlantis, Souq Madinat Jumeirah & Burj Al Arab, Quartiere storico Al Bastakiya & Al Fahidi, Giro in Abra sul Dubai Creek, Souq dell''Oro & delle Spezie.

Nota: L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DUBAI MEZZA GIORNATA';

-- DOHA AEROPORTO
UPDATE tours SET description_it = 'Vi veniamo a prendere direttamente dall''aeroporto questo è un tour preimbarco.

Esploreremo Doha, un''affascinante fusione di tradizione e modernità, con un tour di 5 ore che ti condurrà tra i luoghi più iconici della capitale del Qatar. Il tour parte con una panoramica della Corniche, un lungomare di 7 km con vista spettacolare sulla baia di Doha, circondato da grattacieli futuristici, dal Museo di Arte Islamica e dall''iconico Sheraton Hotel.

Visiteremo The Pearl, un''isola artificiale con complessi residenziali e commerciali di lusso e Katara Cultural Village, un centro culturale che combina architettura moderna e tradizionale con gallerie d''arte, anfiteatri e una splendida moschea.

Proseguiremo alla scoperta di Lusail, la zona più innovativa e futuristica di Doha, per poi immergerci nella tradizione visitando il vibrante Souq Waqif, il mercato all''aperto più antico del Qatar. Qui potrai visitare il Falcon Souq e il Falcon Hospital successivamente avrai tutto il tempo per perderti nel dedalo di vicoli e negozi artigianali.

Tour in breve: Corniche, Villaggio Culturale di Katara, L''Isola della Perla, Luisail, Souq Waqif.

Nota: L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DOHA AEROPORTO';

-- DOHA XL
UPDATE tours SET description_it = 'Esploreremo Doha, un''affascinante fusione di tradizione e modernità, con un tour che ti condurrà tra i luoghi più iconici della capitale del Qatar. Il tour parte con una panoramica della Corniche, un lungomare di 7 km con vista spettacolare sulla baia di Doha, circondato da grattacieli futuristici, dal Museo di Arte Islamica e dall''iconico Sheraton Hotel.

Visiteremo The Pearl, un''isola artificiale con complessi residenziali e commerciali di lusso e Katara Cultural Village, un centro culturale che combina architettura moderna e tradizionale con gallerie d''arte, anfiteatri e una splendida moschea.

Proseguiremo alla scoperta di Lusail, la zona più innovativa e futuristica di Doha, per poi immergerci nella tradizione visitando il vibrante Souq Waqif, il mercato all''aperto più antico del Qatar. Qui la sosta dura due ore e potrai visitare il Falcon Souq e il Falcon Hospital successivamente avrai tutto il tempo per perderti nel dedalo di vicoli e negozi artigianali con questo tour non si corre.

Se lo desideri, potrai aggiungere una visita al Museo Nazionale del Qatar, un capolavoro dell''architetto Jean Nouvel, che offre un percorso interattivo multimediale che racconta la storia del Qatar.

Tour in breve: Corniche, Villaggio Culturale di Katara, L''Isola della Perla, Luisail, Souq Waqif.

Nota: Supplemento Museo 20€ pp (bambini gratis). Durata tour con museo 7 ore. L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DOHA XL';

-- MANAMA CITY
UPDATE tours SET description_it = 'Il nostro tour inizia con la visita del Museo Nazionale del Bahrain, inaugurato nel 1988 e considerato uno dei più importanti nella regione del Golfo. Qui potrai esplorare esposizioni dinamiche che raccontano l''affascinante passato di questo paese.

In seguito visiteremo la Moschea di Al Fateh per ammirare la sua straordinaria architettura. Successivamente ci dirigeremo verso il vivace Souq del Bahrain, un tipico mercato, dove potrai curiosare tra le bancarelle e acquistare souvenir, spezie, tessuti e artigianato tradizionale.

Tempo permettendo, faremo anche un foto stop al Forte del Bahrain (o Forte Portoghese) un imponente sito archeologico alto 12 metri, che conserva sette strati creati da diversi occupanti dal 2300 a.C. fino al XVIII secolo.

Tour in breve: Museo del Bahrein, Souq del Bahrain, Forte del Bahrain, Moschea Al Fatteh.

Nota: L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'MANAMA CITY';

-- MANAMA & CIRCUITO F1
UPDATE tours SET description_it = 'La nostra giornata inizia con un''esperienza straordinaria al Circuito di Formula 1 del Bahrain (BIC), uno dei più all''avanguardia e spettacolari al mondo. Se scegli il tour VIP, avrai accesso esclusivo alla prestigiosa sala media, potrai visitare la torre di controllo e percorrere alcuni tratti della pista vivendo da vicino l''emozione della Formula 1. Un''occasione imperdibile per gli appassionati di motorsport!

Se invece opti per il tour standard, visiteremo insieme il Grand Stand, i blocchi di partenza e il negozio di souvenir del circuito. Durante l''attesa del gruppo VIP, potrai fare una breve visita a un allevamento di cammelli.

Proseguiremo la nostra avventura con una visita alla Moschea di Al Fateh per ammirare la sua straordinaria architettura. Dopo la Moschea, ci immergeremo nella vibrante atmosfera del Souq del Bahrain. Tra le sue pittoresche stradine, avrai l''opportunità di esplorare mercati ricchi di spezie esotiche, tessuti pregiati, gioielli in oro e autentici souvenir tradizionali.

Tour in breve: Circuito Formula 1 del Bahrein con Tour VIP facoltativo, Moschea Al Fateh, Souq del Bahrain.

Nota: Supplemento tour VIP 25 €. L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'MANAMA & CIRCUITO F1';

-- MUSCAT CITY
UPDATE tours SET description_it = 'La nostra prima tappa sarà la magnifica Grande Moschea del Sultano Qaboos una gemma architettonica che incarna la bellezza dell''arte e del design islamico. Qui avrai l''opportunità di ammirare uno dei più grandi tappeti persiani al mondo, un vero capolavoro.

Faremo poi una sosta per fotografare l''imponente struttura della Royal Opera House e il suo meraviglioso giardino, un esempio di eleganza e raffinatezza. Procederemo quindi verso Muscat, l''antica capitale, dove la storia prende vita.

Ammireremo la posizione strategica della città e i suoi imponenti forti storici, Al Jalali e Al Mirani, arroccati su scogliere a picco sul mare. Passeremo davanti al maestoso Palazzo Al Alam, la residenza cerimoniale del Sultano e faremo una passeggiata lungo gli eleganti edifici del Diwan immergendoci nell''atmosfera unica di questa città senza tempo.

Infine ci immergeremo nell''atmosfera vivace della zona di Mutrah. Esplorerai il colorato Souq, dove rimarrai incantato dai prodotti tradizionali omaniti. Scoprirai i caratteristici cappelli omaniti, chiamati "kumma", profumi artigianali e splendidi manufatti in legno e argento.

Tour in breve: Grande Moschea del Sultano Qaboos, Opera House, Mutrah Souq, Forti di Al Jilali Al Mirani, Palazzo Al-Alam.

Nota: Per l''ingresso in moschea sono obbligatorie maniche lunghe e pantaloni lunghi con foulard in testa per le donne mentre per gli uomini pantaloni lunghi.' 
WHERE name = 'MUSCAT CITY';

-- DOHA DESERT SAFARI & SOUK WAKIF
UPDATE tours SET description_it = 'Un emozionante safari nel deserto di Doha che combina avventura e tradizione. Partiremo dalla città con un autista esperto, parlante inglese, in jeep 4x4, che ti condurrà attraverso il deserto in un viaggio di circa 45 minuti.

Preparati per un avventura carica di adrenalina mentre il nostro autista esperto ti condurrà in un''emozionante corsa sulle dune tra salite vertiginose e discese mozzafiato. Dopo il Dune Bashing potrai cimentarti nel sandboarding: scivolando giù dalle dune su una tavola provando l''emozione di ''surfare'' sulla sabbia dorata del deserto.

Raggiungeremo poi il Mare Interno di Khor Al-Udaid, un paesaggio unico dove il mare si incontra con il deserto, patrimonio dell''UNESCO. Infine, faremo ritorno in città con una sosta al caratteristico Souq Waqif dove potrai esplorare il mercato arabo più antico del Qatar e visitare il Falcon Souq.

Tour in breve: Pick up in Jeep 4x4, Dune Bashing, Sand Boarding, Khor al Udaid, Souk Wakif.

Nota: Supplemento giro in cammello 6-8 €. L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DOHA DESERT SAFARI & SOUK WAKIF';

-- DUBAI DESERTO+CENA SPETTACOLO
UPDATE tours SET description_it = 'L''avventura inizia con il pick-up direttamente dalla nave a bordo di una jeep 4x4. Lasciamo alle spalle il trambusto della città mentre ci dirigiamo verso il cuore del deserto di Dubai, una distesa infinita di sabbia dorata. Prima di avventurarti sulle dune, avrai l''opportunità di fare un giro con il Quad o sul Dune Buggy (attività a pagamento).

Preparati per un''avventura carica di adrenalina mentre il nostro autista esperto ti condurrà in un''emozionante corsa sulle dune tra salite vertiginose e discese mozzafiato. Dopo il Dune Bashing potrai cimentarti nel sandboarding: scivolando giù dalle dune su una tavola provando l''emozione di ''surfare'' sulla sabbia dorata del deserto.

Raggiungeremo un accogliente campo tendato immerso nel deserto, dove potrai rilassarti e goderti diverse attività tradizionali. Potrai fare una passeggiata sul cammello. Se lo desideri, avrai la possibilità di decorare le mani con disegni all''henné o indossare il tipico abito arabo per una fotografia ricordo.

Mentre il sole tramonta ti serviranno una deliziosa cena a buffet con una varietà di piatti tradizionali. Le bevande analcoliche sono illimitate. La serata si animerà con uno spettacolo mozzafiato che include la danza del ventre e il Tanoura Show, un''antica danza caratterizzata dai costumi colorati e dai movimenti vorticosi dei danzatori.

Tour in breve: Pick-up in jeep 4x4, Possibilità di affittare il Quad (a pagamento), Dune Bashing, Campo tendato con attività tradizionali, Cena a buffet sotto le stelle, Spettacolo dal vivo.

Nota: Questo tour è disponibile anche ad Abu Dhabi chiedici info su whats app. L''itinerario potrebbe subire variazioni in base alle condizioni del traffico.' 
WHERE name = 'DUBAI DESERTO+CENA SPETTACOLO';

-- Return updated tours to verify
SELECT id, name, 
       CASE WHEN description_it IS NOT NULL THEN 'Italian Added' ELSE 'No Italian' END as italian_status,
       LEFT(description_it, 50) as italian_preview
FROM tours ORDER BY id;
