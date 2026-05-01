# Anomalies — backlog backend

Liste exhaustive des anomalies que Cabs **pourrait** détecter automatiquement à partir des données saisies par les chauffeurs (et seulement de ces données — pas de connexion API plateforme).

Chaque entrée :
- **Règle** : la condition technique de détection
- **Pourquoi** : ce que ça révèle pour le patron
- **Données requises** : ce qu'il faut côté schéma
- **Sévérité** : `high` (action immédiate) · `medium` (à examiner) · `low` (info)
- **Fréquence** : `realtime` · `hourly` · `daily` · `weekly`

Liste à trier ensemble côté backend pour décider quoi shipper en bêta.

---

## 1. Saisie chauffeur (data entry errors)

| # | Anomalie | Règle | Pourquoi | Données | Sévérité | Fréquence |
|---|----------|-------|----------|---------|----------|-----------|
| 1.1 | **Course à 0 €** | `ride.net == 0` | Typo, course non facturée, ou tentative de masquage | `ride.net` | medium | realtime |
| 1.2 | **Net négatif** | `ride.net < 0` | Edge case (remboursement) ou bug de saisie | `ride.net` | high | realtime |
| 1.3 | **Course > 3 h** | `ride.duration > 180min` | Course probablement oubliée dans l'app | `ride.startedAt`, `ride.endedAt` | medium | realtime |
| 1.4 | **Plateforme manquante** | `ride.platform IS NULL` | Réconciliation comptable impossible | `ride.platform` | high | realtime |
| 1.5 | **Heure fin avant heure début** | `endedAt < startedAt` | Erreur évidente | `ride.startedAt`, `ride.endedAt` | high | realtime |
| 1.6 | **Date dans le futur** | `startedAt > now()` | Saisie corrompue | `ride.startedAt` | high | realtime |
| 1.7 | **Net incohérent vs durée** | `net/duration < €0.10/min` ou `> €5/min` | Out-of-band, suggest saisie erronée | `ride.net`, `duration` | low | hourly |
| 1.8 | **Doublons potentiels** | Même `driver+net+startedAt±1min` | Double-tap accidentel | `ride.*` | medium | realtime |
| 1.9 | **Pourboire > 50 % du fare** | `tip / net > 0.5` | Champ tip mal compris ou typo | `ride.tip`, `ride.net` | low | daily |

---

## 2. Comportement chauffeur suspect (fraud signals)

| # | Anomalie | Règle | Pourquoi | Données | Sévérité | Fréquence |
|---|----------|-------|----------|---------|----------|-----------|
| 2.1 | **Cash sans dépôt depuis 7 j** | `last_deposit_age > 7d` ET `cash_balance > 0` | Chauffeur garde du cash en poche trop longtemps | `rides.payment`, `deposits` | medium | daily |
| 2.2 | **Cash dépassant seuil** | `cash_balance > €X` (configurable) | Risque de perte/vol/skim | `cash_balance` | high | daily |
| 2.3 | **Course cash 3× > moyenne chauffeur** | `ride.net > 3 * driver.avg_cash` | Possible surfacturation passager | `ride.net`, `driver.avg` | high | realtime |
| 2.4 | **Course cash juste après plateforme au même endroit** | Successivement, `<5min`, `<200m`, mais payment switche | Possible "off the books" sur la même course | GPS + payment seq | medium | hourly |
| 2.5 | **Pickup/dropoff hors zone flotte** | GPS hors polygone défini | Chauffeur en maraude non autorisée | GPS coords + zone polygons | medium | realtime |
| 2.6 | **Plateforme contractuelle jamais utilisée** | `0 rides on platform X over 30d` mais contrat actif | Chauffeur ignore une plateforme imposée | rides.platform per driver | low | weekly |
| 2.7 | **Taux d'annulation chauffeur élevé** | `cancellation_rate > 15 %` sur 7 j | Cherry-picking de courses | rides.status | medium | daily |
| 2.8 | **Saisie en batch suspecte** | `>5 rides created within 1min` | Catch-up 23h ou tentative de bourrage | `ride.createdAt` | medium | realtime |
| 2.9 | **Décalage createdAt vs startedAt** | `createdAt - startedAt > 12h` | Saisie tardive systématique | `ride.createdAt`, `ride.startedAt` | low | daily |

---

## 3. Compliance / légal (Belgique)

| # | Anomalie | Règle | Pourquoi | Données | Sévérité | Fréquence |
|---|----------|-------|----------|---------|----------|-----------|
| 3.1 | **Shift > 9 h** | `shift.duration > 9h` | Réglementation taxi BE — risque amende patron | `shift.startedAt/endedAt` | high | realtime |
| 3.2 | **Repos < 11 h entre deux shifts** | `gap(shift_n.end, shift_n+1.start) < 11h` | Code du travail BE | `shifts[]` | high | realtime |
| 3.3 | **Pause manquante** | `4.5h continuous driving without 30min break` | Obligation légale | shift events | medium | hourly |
| 3.4 | **Travail dimanche non prévu** | Sunday shift non listé dans `agreement.workdays` | Conflit contrat | `shift`, `agreement` | low | daily |
| 3.5 | **Document chauffeur expiré** | `expiry_date < today` | Risque légal immédiat | `driver.documents` | high | daily |
| 3.6 | **Document chauffeur expirant ≤ 30 j** | `expiry_date - today ≤ 30d` | Anticipation renouvellement | `driver.documents` | medium | daily |
| 3.7 | **Contrôle technique véhicule expiré** | `inspection_expiry < today` | Véhicule non conforme | `vehicle.inspection` | high | daily |
| 3.8 | **Assurance véhicule expirée** | `insurance_expiry < today` | Couverture nulle, illégal | `vehicle.insurance` | high | daily |
| 3.9 | **Carte taxi expirée** | `taxi_card_expiry < today` | Région BE — interdiction d'opérer | `vehicle.taxi_card` | high | daily |

---

## 4. Cohérence opérationnelle

| # | Anomalie | Règle | Pourquoi | Données | Sévérité | Fréquence |
|---|----------|-------|----------|---------|----------|-----------|
| 4.1 | **Gap > 2 h sur shift actif** | Pas de course pendant 2 h alors que shift `active` | Pause prolongée ou app oubliée | shift, rides | low | hourly |
| 4.2 | **Shift entier sans course** | `shift.duration > 1h` ET `0 rides` | Chauffeur clocké mais inactif | shift, rides | medium | hourly |
| 4.3 | **Course hors d'un shift actif** | `ride.startedAt` n'a pas de shift englobant | Saisie a posteriori suspecte | `ride.startedAt`, `shifts` | medium | realtime |
| 4.4 | **Véhicule en double usage** | Deux shifts actifs sur le même `vehicle_id` | Impossible physiquement | `shift.vehicle_id` | high | realtime |
| 4.5 | **Chauffeur sur 2 véhicules** | Deux shifts actifs sur le même `driver_id` | Impossible physiquement | `shift.driver_id` | high | realtime |
| 4.6 | **Photo prise de poste manquante** | `shift.start_odo_photo IS NULL` après début | Impossible de prouver l'état du véhicule | `shift.start_odo_photo` | medium | hourly |
| 4.7 | **Photo fin de poste manquante** | `shift.end_odo_photo IS NULL` après fin | Idem | `shift.end_odo_photo` | medium | hourly |
| 4.8 | **Kilométrage régressif** | `end_odometer < start_odometer` | OCR raté ou triche | `shift.odometer.*` | high | realtime |
| 4.9 | **Saut kilométrique excessif** | `delta > 800 km` sur un shift | OCR raté ou véhicule emprunté hors shift | `shift.odometer.*` | high | realtime |
| 4.10 | **Shift actif sans GPS** | `shift.active` ET `0 GPS pings > 30min` | Phone éteint ou app fermée | shift, gps_log | low | hourly |

---

## 5. Indicateurs financiers (red flags)

| # | Anomalie | Règle | Pourquoi | Données | Sévérité | Fréquence |
|---|----------|-------|----------|---------|----------|-----------|
| 5.1 | **CA chauffeur sous seuil quotidien** | `daily_net < threshold(driver)` | Sous-performance ponctuelle | aggregated rides | low | daily |
| 5.2 | **CA véhicule sous seuil** | `vehicle_daily_net < threshold` | Véhicule inutilisé ou en panne | aggregated | low | daily |
| 5.3 | **Forfait non atteint** | `chauffeur en forfait` ET `revenu shift < forfait` | Patron paye à perte | shift, formula | medium | daily |
| 5.4 | **Variation jour-J vs J-1 > 50 %** | `|today.net - yesterday.net| / yesterday.net > 0.5` | Détection de drop ou pic anormal | time-series | low | daily |
| 5.5 | **Carburant > 30 % du CA** | `fuel_spend / net > 0.3` | Conso anormale ou trajets vides | fuel logs, rides | medium | weekly |
| 5.6 | **Ratio cash/total trop élevé** | `cash_share > 50 %` sur 7 j (chauffeur) | Possible évasion de saisie plateforme | rides.payment | low | weekly |

---

## 6. Système / technique

| # | Anomalie | Règle | Pourquoi | Données | Sévérité | Fréquence |
|---|----------|-------|----------|---------|----------|-----------|
| 6.1 | **App pas synchro > 1 h** | `app.last_ping > 60min ago` ET `shift.active` | Téléphone offline ou app crashée | `app.last_ping` | low | hourly |
| 6.2 | **App version obsolète** | `app.version < min_supported` | Risque de bugs / data loss | `app.version` | low | daily |
| 6.3 | **Sync conflict** | Conflit entre saisie chauffeur et édit admin | Override potentiel | sync logs | medium | realtime |
| 6.4 | **OCR confidence basse** | `ocr.confidence < 0.7` sur photo odo | Lecture incertaine, risque erreur km | ocr metadata | low | realtime |
| 6.5 | **Photo odo illisible** | `ocr.error == true` | Photo floue/sombre | ocr | medium | realtime |

---

## Pour discussion équipe backend

**Questions à trancher avant implémentation :**

1. **Scope MVP** : on shippe quelles règles dans la bêta privée ? Ma proposition : tout `high` + 1.1, 1.3, 1.4, 4.1, 4.4 dès le début. Le reste en V1.1.
2. **Storage** : table `anomalies` dédiée vs flag sur les tables existantes ? Recommandation : table dédiée pour traçabilité (résolution, qui a clos, quand).
3. **Fréquence de check** : cron jobs (daily/hourly) vs triggers DB realtime vs queue de jobs ? Probablement hybride : `realtime` via triggers Postgres + jobs scheduled pour le reste.
4. **Snooze / résolution** : un patron doit pouvoir marquer "résolu" ou "snooze 24h" pour ne pas voir la même anomalie en boucle.
5. **Notifications push** : quelles sévérités envoient un push au patron ? `high` uniquement, sinon le patron sera spammé.
6. **Configurabilité par patron** : seuils (€ cash max, heures min, etc.) doivent être paramétrables par flotte. Schema `fleet_anomaly_settings`.
7. **Faux positifs** : les règles "comportement suspect" (section 2) sont les plus risquées. Prévoir un mode "shadow" qui détecte sans afficher pendant 2-4 sem pour calibrer les seuils sur la donnée réelle.
8. **Audit log** : qui a vu / fermé / snoozé chaque anomalie ? Important si dispute avec un chauffeur.

**Stack côté backend (à confirmer)** :
- Postgres avec triggers + Functions pour les checks `realtime`
- Worker (Sidekiq/BullMQ/Inngest) pour les jobs `daily/weekly`
- Webhook vers le service de notif (push + email)
- Endpoint API `GET /anomalies?status=open&severity=high` consommé par le dashboard
