# Database derivato da OpenStreetMap — AOI-001 (San Mariano, Corciano)

Questi file sono offerti ai sensi della sezione 4.6 della Open Database License (ODbL) 1.0 insieme alla build di SBATTI che ne è un *Produced Work*. Contengono informazioni da OpenStreetMap, rese disponibili con licenza ODbL: https://opendatacommons.org/licenses/odbl/1-0/ — © OpenStreetMap contributors, https://www.openstreetmap.org/copyright

- `osm-extract.json`: strade ed edifici dell'estensione dell'AOI (query Overpass e `osm_base` nel file).
- `osm-detail-extract.json`: attraversamenti, fermate, alberi, parcheggi, barriere, marciapiedi, landuse/leisure.
- `derived-world.json`: database derivato usato dalla build (grafo stradale con quote, spawn, percorso di prova, provenienza e report).
- `derived-detail.json`: metadati della vertical slice (posizioni e provenienza degli elementi, VERIFIED da OSM o ESTIMATED).

Le quote combinano OSM con TINITALY/1.1 (Tarquini et al. 2023, INGV, https://doi.org/10.13127/tinitaly/1.1, CC BY 4.0): modello del terreno ricampionato, livellato e adattato alle strade, quindi modificato rispetto all'originale. Il database derivato è distribuito con licenza ODbL 1.0; le parti TINITALY restano soggette a CC BY 4.0. Il codice del gioco non è incluso e non è concesso con queste licenze.
