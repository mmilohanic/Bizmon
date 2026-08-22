# Bizmon

&emsp;Aplikacija za upravljanje poslovnom dokumentacijom (ponude, narudžbe, radni nalozi, računi) s mogućnošću evidencije vlastitih artikala i klijenata, te preuzimanjem dokumenata u PDF formatu.

**Link aplikacije:** [Bizmon](https://biz-mon.web.app)

## Opći podaci o projektu

- **Sveučilište:** Sveučilište Jurja Dobrile u Puli ([UNIPU](https://www.unipu.hr/))<br>
- **Fakultet:** Fakultet informatike u Puli ([FIPU](https://fipu.unipu.hr/))<br>
- **Kolegij:** [Programsko inženjerstvo](https://ntankovic.unipu.hr/pi)
- **Mentor:** [doc. dr. sc. Nikola Tanković](https://ntankovic.unipu.hr)
- **Oznaka tima:** 337/25
- **Članovi tima:** Mikel Milohanić

## Cilj projekta

Cilj projekta je demonstrirati primjenu znanja stečenog kroz kolegij Programsko inženjerstvo, od analize zahtjeva i dizajniranja sustava, do izrade prototipa aplikacije te razvoja funkcionalne aplikacije koja je [javno dostupna](https://biz-mon.web.app).

## Opis funkcionalnosti

- registracija i prijava
- prijava Google računom
- pregled osnovne statistike
- pregled nedavno korištenih dokumenata
- upravljanje stavkama
- upravljanje klijentima
- upravljanje ponudama
- upravljanje narudžbama
- upravljanje radnim nalozima
- upravljanje računima
- pretraživanje artikala i klijenata
- pretraživanje i filtriranje dokumenata
- pregled i dodjeljivanje statusa dokumenata
- uređivanje stavki na dokumentima bez utjecaja na originalne stavke
- preuzimanje ponuda i računa u PDF formatu

## Prototip

- [Figma](https://www.figma.com/proto/0zPI6AQeHFNFnrsbgaOPZp/Bizmon?node-id=36-28&p=f&t=axUqMlW8m9VYEKKl-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=36%3A28&show-proto-sidebar=1)

## Tehnologije

Projekt koristi sljedeće tehnologije:

| Tehnologija | Uloga |
| --- | --- |
| Vue 3 (Composition API) | Razvojni okvir korisničkog sučelja |
| Vue Router | Usmjeravanje |
| Tailwind CSS 4 | Stiliziranje sučelja |
| Firebase Authentication | Autentifikacija korisnika |
| Cloud Firestore | Baza podataka |
| Firebase Hosting | Posluživanje aplikacije na internetu |
| pdfmake | Generiranje PDF dokumenata |


## Moguće buduće nadogradnje

- pretvorba između dokumenata (npr. kreiranje računa iz postojeće ponude ili radnog naloga)
- međusobna suradnja korisnika na radnim nalozima
- zakonska usklađenost (fiskalizacija, eRačun)
