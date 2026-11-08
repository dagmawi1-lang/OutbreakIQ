# Test plan

## Automated checks

- CDC field normalization accepts common NNDSS field aliases.
- Suppression/status markers remain missing values rather than being converted to zero.
- Rows missing core fields are rejected.
- A large observation relative to its rolling history is flagged by the baseline detector.

## Manual browser checks

1. Start the server and Vite dev process.
2. Confirm the dashboard loads in demo mode and clearly identifies synthetic data.
3. Change condition, reporting area, and time-window filters.
4. Select a map marker and verify the location filter updates.
5. Search the observation table and export CSV.
6. Import the included sample CSV and confirm it is labeled user-imported.
7. Connect CDC data and confirm the interface displays the provisional-data notice.
8. Ask the explanation assistant a question and verify it only discusses visible data.
9. Check responsive behavior at desktop, tablet, and phone widths.
10. Verify no browser console errors and that the app remains usable if CDC is unavailable.
