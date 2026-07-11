# Teable Field Audit — July 10, 2026

## Record Counts (Total: 4,557)

| Table | ID | Count |
|---|---|---|
| AI Tools | tblS7vjGSuWROZFq9r9 | 850 |
| GitHub Repos | tblFsDHe3wZJd4bFYhE | 2,601 |
| LLMs | tblv1YURAXKHjeBw9AP | 698 |
| Video & Image | tblOlwqkcsmPHNOdwJq | 115 |
| Music & Voice | tbljwEByCe3W8XOzX6O | 99 |
| Chatbots & Agents | tble6TC5cfMmNFB7RX7 | 180 |
| AI News | tblRHsm9twyvqImIjnO | 0 |
| LTDs | tblDHspvIvj0Gun70CE | 14 |

## Field Structures

### AI Tools (tblS7vjGSuWROZFq9r9)
- Name (string)
- Slug (string)
- Summary - EN (string) — English description
- Summary - ES (string) — Spanish description
- OutboundUrl (string) — direct URL
- LogoUrl (string) — icon URL
- Rating 1-5 (string/number) — rating from 1 to 5
- Category (string) — e.g. "Other", "Development"
- Affiliate (boolean) — checkbox for affiliate
- AffiliateUrl (string) — affiliate URL (when Affiliate is true)

### GitHub Repos (tblFsDHe3wZJd4bFYhE)
- Name (string)
- Repository URL (string)
- Description (string)
- Owner (string)
- Stars (number)
- LogoUrl (string)
- Status (string) — e.g. "To review"
- Summary - EN (string)
- Summary - ES (string)
- Rating 1-5 (string/number)

### LLMs (tblv1YURAXKHjeBw9AP)
- Name (string)
- Summary - EN (string)
- Summary - ES (string)
- Provider Type (string) — e.g. "Model Provider"
- OutboundUrl (string)
- Source Tool Record ID (string)
- LogoURL (string)
- AffiliateURL (string) — affiliate URL
- Rating 1-5 (string/number)
- AffiliateStatus (string) — e.g. "Needs Signup"
- Affiliate (boolean)

### Video & Image (tblOlwqkcsmPHNOdwJq)
- Name (string)
- Slug (string)
- OutboundUrl (string)
- Category (string) — e.g. "Video/Image LLM"
- LogoURL (string) + LogoUrl (string) — both exist
- Summary - EN (string)
- Summary - ES (string)
- Rating 1-5 (string/number)

### Music & Voice (tbljwEByCe3W8XOzX6O)
- Name (string)
- Slug (string)
- OutboundUrl (string)
- Category (string) — e.g. "Music/Voice"
- LogoURL (string) + LogoUrl (string)
- Summary - EN (string)
- Summary - ES (string)
- Rating 1-5 (string/number)

### Chatbots & Agents (tble6TC5cfMmNFB7RX7)
- Name (string)
- Slug (string)
- OutboundUrl (string)
- Category (string) — e.g. "Chatbots/Agents"
- LogoURL (string) + LogoUrl (string)
- Summary - EN (string)
- Summary - ES (string)
- Rating 1-5 (string/number)
- Affiliate (boolean)
- Affiliate URL (string) — note: space in field name!

### AI News (tblRHsm9twyvqImIjnO)
- No records yet

### LTDs (tblDHspvIvj0Gun70CE)
- Name (string)
- Website (string)
- Summary (string) — legacy field
- Deal URL (string)
- Platform (string) — e.g. "AppSumo"
- Status (string) — e.g. "Evaluating"
- LogoURL (string) + LogoUrl (string)
- Summary - EN (string)
- Summary - ES (string)
- Rating 1-5 (string/number)

## Key Observations

1. All tables now have `Summary - EN` and `Summary - ES` for bilingual descriptions
2. All tables have `Rating 1-5` for star ratings
3. Affiliate fields vary by table:
   - AI Tools: `Affiliate` (bool) + `AffiliateUrl` (string)
   - LLMs: `Affiliate` (bool) + `AffiliateURL` (string) + `AffiliateStatus` (string)
   - Chatbots: `Affiliate` (bool) + `Affiliate URL` (string, space in name!)
4. Logo URL field name is inconsistent: `LogoUrl` vs `LogoURL` (some tables have both)
5. Total across all tables: 4,557 records
