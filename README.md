# GMMS

<a href="https://www.figma.com/design/W4uj9CqjMiPBDVK0aQuC6D/MMS?node-id=24-4&p=f&t=hXIVnFank3XaXfP7-0" target="_blank">Figma</a>

landing
SAAS landing page (front landing page done)

## Shared landing-page chrome

`index_header.html` and `index_footer.html` hold the reusable site header and footer. New root-level HTML pages can load them by keeping the existing Bootstrap, `css/style.css`, and `js/script.js` references, then adding these placeholders around their main content:

```html
<div data-include="index_header.html"></div>
<main><!-- page-specific content --></main>
<div data-include="index_footer.html"></div>
```

`js/script.js` loads the fragments automatically after the page is ready.

Admin users
admin dashboard

management
members
members profile
sessions
leads
reports page (last)

administration
plans
policies
staff list
audit?

todolist icey:

make the members page from scratch using bootstrap, try to reuse components and elements from style.css
get checkboxes
try to make staff schedule page on your own
once familliar, replicate it for session page

book session modal
create plan modal

policies
staff list

configure header and footer for admin pages
