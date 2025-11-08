# **App Name**: ArchViz

## Core Features:

- Component Management: Add, edit, and delete components with fields for id, name, aplicacionId, padreId, type, and level.
- Data Filtering: Filter components displayed in the table and diagram based on the selected application ID via a dropdown.
- PlantUML Generation: Dynamically generate PlantUML code from the filtered component data, using 'nivel' for structuring and 'padreId' for hierarchical relationships.
- Diagram Rendering: Render the generated PlantUML code as a diagram in the visualization area.
- Local Storage Persistence: Store and manage all component data in the browser's local storage.
- Initial Data Load: Initialize the application state with the provided dummy data.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF), symbolizing clarity and structure, complemented by shades reflecting architectural blueprints.
- Background color: Very light gray (#F0F8FF), almost white, providing a clean, uncluttered canvas.
- Accent color: Coral (#FF8050) to highlight interactive elements and diagram components, providing contrast and drawing user attention.
- Body and headline font: 'Inter', a sans-serif font providing a clean, readable style for both headings and content.
- Split-screen layout with component management table on the left and diagram visualization on the right.
- Use minimalist icons for component types, such as circles, squares and triangles.