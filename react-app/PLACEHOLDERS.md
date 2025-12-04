# Template Placeholder Reference Guide

Complete reference for all available placeholders in employee document templates.

## Company Information

| Placeholder | Type | Example | Description |
|------------|------|---------|-------------|
| `{{bedrijfsnaam}}` | string | "Solvere Solutions BV" | Company name |
| `{{adres_bedrijf}}` | string | "Hoofdstraat 123" | Company street address |
| `{{gemeente_bedrijf}}` | string | "Brussel" | Company city |
| `{{postcode_gemeente_bedrijf}}` | string | "1000 Brussel" | Company postal code + city |
| `{{erkenning_nr}}` | string | "BE-123456789" | Belgian recognition/accreditation number |
| `{{company_logo_image_tag\|safe}}` | HTML | `<img src="..." />` | Company logo as HTML image tag |

## Employee Information

| Placeholder | Type | Example | Description |
|------------|------|---------|-------------|
| `{{naam_voornaam_werknemer}}` | string | "Jan Janssens" | Employee full name |
| `{{volledig_adres_werknemer}}` | string | "Kerkstraat 45" | Employee street address only |
| `{{complete_adres_werknemer}}` | string | "Kerkstraat 45, 2000 Antwerpen" | Complete address with city |
| `{{postcode_gemeente_werknemer}}` | string | "2000 Antwerpen" | Employee postal code + city |

## Compensation

| Placeholder | Type | Example | Description |
|------------|------|---------|-------------|
| `{{start_uurloon}}` | number | 12.50 | Starting hourly wage (€) |
| `{{huidige_uurloon}}` | number | 13.75 | Current hourly wage (€) |

## Dates

| Placeholder | Type | Example | Description |
|------------|------|---------|-------------|
| `{{current_date}}` | string | "15/03/2024" | Current date (DD/MM/YYYY) |
| `{{current_date_time}}` | string | "vrijdag 15 maart 2024" | Current date in Dutch format |
| `{{van_date}}` | string | "01/03/2024" | Start date (DD/MM/YYYY) |

## System

| Placeholder | Type | Example | Description |
|------------|------|---------|-------------|
| `{{request_user}}` | string | "Maria Verstraeten" | User who generated the document |

## Planning Information (Planning Templates Only)

### Weekly Hours

| Placeholder | Type | Example | Description |
|------------|------|---------|-------------|
| `{{contractual_hours}}` | number | 20.0 | Contractual hours per week |
| `{{weekly_hour_difference}}` | number | 0.5 | Difference from standard hours |

### Hour Selection Dropdowns

| Placeholder | Type | Description |
|------------|------|-------------|
| `{{morning_hour_options\|safe}}` | HTML | HTML `<option>` tags for morning hours (06:00-12:00) |
| `{{evening_hour_options\|safe}}` | HTML | HTML `<option>` tags for evening hours (12:00-22:00) |

### Even Week Schedule (prefix: e_)

**Days:** mo (Monday), tu (Tuesday), we (Wednesday), th (Thursday), fr (Friday), sa (Saturday), su (Sunday)

**Session:** morn (morning), eve (evening)

**Time:** start, end

**Pattern:** `{{e_[day]_[session]_[time]}}`

**Examples:**
- `{{e_mo_morn_start}}` - Even week, Monday morning start time
- `{{e_mo_morn_end}}` - Even week, Monday morning end time
- `{{e_mo_eve_start}}` - Even week, Monday evening start time
- `{{e_mo_eve_end}}` - Even week, Monday evening end time

**All Even Week Fields:**

Monday:
- `{{e_mo_morn_start}}`, `{{e_mo_morn_end}}`
- `{{e_mo_eve_start}}`, `{{e_mo_eve_end}}`

Tuesday:
- `{{e_tu_morn_start}}`, `{{e_tu_morn_end}}`
- `{{e_tu_eve_start}}`, `{{e_tu_eve_end}}`

Wednesday:
- `{{e_we_morn_start}}`, `{{e_we_morn_end}}`
- `{{e_we_eve_start}}`, `{{e_we_eve_end}}`

Thursday:
- `{{e_th_morn_start}}`, `{{e_th_morn_end}}`
- `{{e_th_eve_start}}`, `{{e_th_eve_end}}`

Friday:
- `{{e_fr_morn_start}}`, `{{e_fr_morn_end}}`
- `{{e_fr_eve_start}}`, `{{e_fr_eve_end}}`

Saturday:
- `{{e_sa_morn_start}}`, `{{e_sa_morn_end}}`
- `{{e_sa_eve_start}}`, `{{e_sa_eve_end}}`

Sunday:
- `{{e_su_morn_start}}`, `{{e_su_morn_end}}`
- `{{e_su_eve_start}}`, `{{e_su_eve_end}}`

### Odd Week Schedule (prefix: o_)

Same pattern as even week but with `o_` prefix instead of `e_`

**Pattern:** `{{o_[day]_[session]_[time]}}`

**Examples:**
- `{{o_mo_morn_start}}` - Odd week, Monday morning start time
- `{{o_tu_eve_end}}` - Odd week, Tuesday evening end time

**All Odd Week Fields:** (Same structure as even week with `o_` prefix)

Monday through Sunday:
- `{{o_mo_*}}`, `{{o_tu_*}}`, `{{o_we_*}}`, `{{o_th_*}}`, `{{o_fr_*}}`, `{{o_sa_*}}`, `{{o_su_*}}`

## Usage Examples

### Basic Text Replacement

```html
<p>Employee Name: {{naam_voornaam_werknemer}}</p>
<p>Current Wage: €{{huidige_uurloon}} per hour</p>
<p>Date: {{current_date}}</p>
```

### HTML Content (use |safe)

```html
<div class="logo">
  {{company_logo_image_tag|safe}}
</div>

<select name="morning_hours">
  {{morning_hour_options|safe}}
</select>
```

### Conditional Display

```html
<!-- Only shows if value exists -->
<p>{{contractual_hours}} hours per week</p>

<!-- Empty values render as empty string -->
<p>Evening shift: {{e_mo_eve_start}} - {{e_mo_eve_end}}</p>
```

### Complete Example

```html
<div class="document">
  <header>
    {{company_logo_image_tag|safe}}
    <h1>Employment Contract</h1>
  </header>
  
  <section>
    <h2>Employer</h2>
    <p><strong>{{bedrijfsnaam}}</strong></p>
    <p>{{adres_bedrijf}}, {{postcode_gemeente_bedrijf}}</p>
    <p>Recognition: {{erkenning_nr}}</p>
  </section>
  
  <section>
    <h2>Employee</h2>
    <p><strong>{{naam_voornaam_werknemer}}</strong></p>
    <p>{{complete_adres_werknemer}}</p>
  </section>
  
  <section>
    <h2>Terms</h2>
    <p>Hourly wage: €{{huidige_uurloon}}</p>
    <p>Weekly hours: {{contractual_hours}}</p>
  </section>
  
  <footer>
    <p>Date: {{current_date_time}}</p>
    <p>Prepared by: {{request_user}}</p>
  </footer>
</div>
```

## Notes

1. **Empty Values**: Missing or empty values render as empty strings (`""`)
2. **HTML Escaping**: Regular placeholders are HTML-escaped for security
3. **Safe Filter**: Use `|safe` only for trusted HTML content
4. **Case Sensitive**: Placeholder names are case-sensitive
5. **Whitespace**: Spaces in placeholders are trimmed automatically

## Template Types

### Planning Templates (IDs: 1, 6, 7)
Require all base fields + planning fields (schedules)

### Non-Planning Templates (IDs: 2-5, 8-14)
Require only base fields (no schedule data)
