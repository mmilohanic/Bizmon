export default function firebaseError(code) {
    const messages = {
        "auth/email-already-in-use": "Email je već registriran.",
        "auth/invalid-email": "Unesite ispravan email.",
        "auth/weak-password": "Lozinka je preslaba.",
        "auth/invalid-credential": "Pogrešan email ili lozinka.",
        "auth/too-many-requests": "Previše pokušaja. Pokušajte kasnije.",

        unavailable: "Nema veze s poslužiteljem. Pokušajte ponovno.",
        "invalid-argument": "Neispravni podaci.",
        "resource-exhausted": "Previše zahtjeva. Pokušajte kasnije.",
        "permission-denied": "Nemate dopuštenje za ovu radnju.",
        "not-found": "Zapis nije pronađen.",

        "auth/popup-blocked": "Skočni prozor je blokiran.",
        "auth/network-request-failed": "Greška mreže pri povezivanju.",
        "auth/user-mismatch": "Potvrda s pogrešnim Google računom.",
    };

    return code in messages
        ? messages[code]
        : "Firebase greška. Pokušajte ponovno.";
}
