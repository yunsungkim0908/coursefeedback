# Activity Overview Component

This component provides a system status dashboard with activity cards for:
- Weekly Digest status
- Survey Responses count
- Reminder scheduling

## Files

- `ActivityOverview.js` - The React component
- `ActivityOverview.css` - The component styles

## Usage

To use this component in the future:

1. Import the component:
```javascript
import { ActivityOverview } from '../components/ActivityOverview'
```

2. Import the styles in your page or in globals.css:
```css
@import '../components/ActivityOverview.css';
```

3. Add the component to your page:
```javascript
<ActivityOverview />
```

## Preview

The component displays:
- A "System Status" header with a pulsing "Live" badge
- Three colorful activity cards in a responsive grid
- Each card shows an icon, title, description, and status badge