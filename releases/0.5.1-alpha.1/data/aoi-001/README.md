# Database derivato da OpenStreetMap — AOI-001 (San Mariano, Corciano)

Questi file sono offerti ai sensi della sezione 4.6 della Open Database License (ODbL) 1.0 insieme alla build di SBATTI che ne è un *Produced Work*. Contengono informazioni da OpenStreetMap, rese disponibili con licenza ODbL: https://opendatacommons.org/licenses/odbl/1-0/ — © OpenStreetMap contributors, https://www.openstreetmap.org/copyright

- `osm-extract.json`: strade ed edifici dell'estensione dell'AOI (query Overpass e `osm_base` nel file).
- `osm-detail-extract.json`: attraversamenti, fermate, alberi, parcheggi, barriere, marciapiedi, landuse/leisure.
- `osm-context-extract.json`: luoghi, sport, barriere, parcheggi e copertura del suolo attorno all'AOI, con i nomi solo dei luoghi pubblici (query Overpass e `osm_base` nel file).
- `derived-world.json`: database derivato usato dalla build (grafo stradale con quote, spawn, percorso di prova, provenienza e report).
- `derived-detail.json`: metadati del dettaglio urbano (posizioni e provenienza degli elementi, VERIFIED da OSM o ESTIMATED).
- `osm-infrastructure-extract.json`: ferrovia, ponti, fossi, tombini, cabine, barriere, idranti, cancelli, fermate e aree pedonali dell'area (query Overpass e `osm_base` nel file), solo tag tecnici.
- `derived-infrastructure.json`: binari con quota del piano del ferro, cavalcavia di Via Verdi (posizione OSM, quote ricostruite o stimate come dichiarato nel file) e percorso del treno scenografico, senza orari reali.

Le quote combinano OSM con il CNR HR-DTM-5m v1.3 (Panza M., Muto M., Rossi M., Alvioli M., Iovine G., Marchesini I. 2026, *5m Resolution Digital Terrain Model for Italy*, https://doi.org/10.5281/zenodo.24009736, CC BY 4.0): modello del terreno ritagliato all'area, campionato e adattato a strade, ferrovia, ponte e scarpate, quindi modificato rispetto all'originale. Il database derivato è distribuito con licenza ODbL 1.0; le parti CNR restano soggette a CC BY 4.0. `derived-detail.json` contiene anche forma e colore dei tetti e presenza di pannelli osservati sull'ortofoto AGEA 2023. Contiene dati AGEA - Ortofoto 2023 (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/. Sono solo osservazioni, nessuna immagine è inclusa; quelle parti restano soggette a CC BY 4.0. Il codice del gioco non è incluso e non è concesso con queste licenze.
