# Monsta Squeeze Website Contract

Status: `validated`  
Mode: `professional`  
Vertical: beverage / retail discovery  
Current phase: implementation and local QA

## Objective

Create the official Monsta Squeeze brand site as a retail-discovery experience. Customers do not purchase on the website. They discover flavors, locate one of the 13 confirmed retailers, open directions, and report a shortage to start a `#FreeSqueeze` claim.

## V1 scope

- Brand-led responsive landing experience
- Eight-product visual lineup using every bottle image from the restock catalog
- Searchable/filterable list of 13 current retailers with exact addresses
- Opt-in browser GPS with nearest-first sorting and approximate straight-line distance
- Google Maps directions links that do not collect browser location
- Shortage report and `#FreeSqueeze` claim-start form using Netlify Forms
- Retailer interest mail link
- Links to Squeeze Rush and the existing retailer portal
- SEO, keyboard navigation, reduced motion, responsive layouts, empty states, and security headers

## Out of scope

- Ecommerce, cart, checkout, prices, shipping, or payment
- Customer accounts
- Guaranteed reward fulfillment logic or unconfirmed promotion rules
- Live inventory by flavor
- Staff CMS or location database integration
- Production deployment and custom-domain setup until separately authorized

## Decisions

- D-001: Retail discovery replaces the ecommerce journey. Source: current user request. Status: approved.
- D-002: The existing 13-location list in Squeeze Rush is the V1 retailer source. Source: repository runtime/tests. Status: validated.
- D-003: Existing logo and bottle renders are identity-locked and reused without redesign. Status: validated.
- D-004: V1 is a lean Vite static site with Netlify Forms, not a framework/backend product. Status: validated.
- D-005: The October 5 full-page Monsta Squeeze reference is the approved visual target: black/yellow/red beverage-campaign palette, oversized brush typography, product-led hero, eight-card flavor grid, compact locator, #FreeSqueeze banner, stocked-cooler retailer section, and seamless atmospheric transitions. Source: current user request. Status: approved.
- D-006: Add a prominent Squeeze Rush promotion between flavor discovery and retail discovery, using official game key art and linking to `https://play.monstasqueeze.com`. Source: current user request and game repository metadata. Status: approved.
- D-007: Rebuild the hero as a three-depth-layer composition using generated atmosphere, the identity-locked Strawberry Lemonade / Classic Lemonade / Half & Half bottle cutouts, and a generated fruit-and-juice foreground. Blueberry is excluded from the hero. Source: current user request. Status: approved.
- D-008: Shortage reports collect no email or phone number. Name remains required, and reporters can either capture a rear-camera photo or upload an existing image. Source: current user request. Status: approved.

## Asset manifest

- A-101: Official Monsta Squeeze logo. Source: user/project asset. Identity-locked.
- A-102: Eight transparent bottle cutouts. Source: approved product photography with generated background extraction. Identity-locked.
- A-103: Three-bottle hero composition. Source: approved project asset. Identity-locked.
- A-104: Monsta character crop. Source: approved Squeeze Rush character sprite. Identity-locked.
- A-105: Mixed-fruit and lemonade-splash atmosphere. Source: generated from the approved visual target; decorative only, no product packaging or factual content.
- A-106: Squeeze Rush landscape and mobile promotion art. Source: official game repository assets. Identity-locked.
- A-107: Squeeze Rush juice-speed motion overlay. Source: generated from the official key art; decorative only, with no characters, logos, packaging, or factual content.
- A-108: Hero atmosphere V2. Source: generated from approved campaign art; decorative black/red/gold background with a left-side copy safe zone and no products or text.
- A-109: Hero fruit splash V2. Source: generated transparent strawberry, lemon, tea-leaf, ice, and juice foreground; no blueberries, bottles, logos, or text.

## Assumptions

- A-001: `hello@monstasqueeze.com` is used as a reversible contact placeholder. Confidence: low; impact: medium; replace before production if incorrect.
- A-002: Shortage reports start a claim review and do not automatically guarantee fulfillment. Confidence: high; impact: high; safe until promotion rules are confirmed.
- A-003: Individual store-level flavor inventory is unknown, so the locator does not claim a specific flavor is currently stocked. Confidence: high; impact: high.
- A-004: Store coordinates are a static geocoded snapshot used only for approximate straight-line distance; directions remain the authoritative travel route. Confidence: high; impact: medium.

## Blockers

- B-001: Official contact email and social links need confirmation before production.
- B-002: `#FreeSqueeze` eligibility, fulfillment, geography, privacy, and legal terms need business approval before production.
- B-003: Netlify site connection, forms activation, analytics, and `monstasqueeze.com` domain routing are not yet configured.

## Acceptance criteria

- Given a customer searches a town, ZIP code, address, or store name, when text is entered, then matching retailers update immediately with an accurate result count.
- Given a retailer card, when Directions is activated, then Google Maps opens with the full confirmed destination address.
- Given no matching retailers, when a search returns zero results, then the empty state offers a direct shortage/area report path.
- Given a customer reports a shortage, when all required fields are completed and the deployed form submits, then Netlify records the submission and routes to the confirmation page.
- Given a phone viewport, when navigating the site, then the menu, flavor rail, store cards, form, and CTAs remain usable without horizontal page overflow.
- Given keyboard-only navigation, when all interactive controls are traversed, then focus is visible and dialogs can be opened and closed.
- Given reduced-motion preference, when the site loads, then marquee and entrance animation are disabled.

## Quality memory

No active global HELIX quality lessons were available at project start.
