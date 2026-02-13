# Contributing

Thank you for contributing to **Protein Transformer Learning**!

## Workflow

This project enforces a Pull Request (PR) workflow to ensure code quality and leverage AI code reviews via **CodeRabbit**.

### 1. Create a Branch

Never push directly to `main`. Create a descriptive branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

Implement your feature or fix. Keep your commits clean and descriptive.

```bash
git add .
git commit -m "feat: Add new analysis feature"
```

### 3. Push and Open a PR

Push your branch to GitHub:

```bash
git push -u origin feature/your-feature-name
```

Then, go to the repository on GitHub and open a **Pull Request**.

### 4. CodeRabbit Review

Once your PR is open, **CodeRabbit** will automatically review your changes. addressing any feedback before merging.

## Code Style

- **Frontend**: Follow ESLint rules (`npm run lint`).
- **Backend**: Respect PEP 8 (`flake8`).
