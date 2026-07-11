# Contributing to SharedReads

Thank you for your interest in contributing to SharedReads! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15+ (or Neon account)
- Git
- Basic knowledge of React and Node.js

### Setup Development Environment

1. **Fork the repository**

```bash
# Click "Fork" on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/shared-reads.git
cd shared-reads
```

2. **Setup Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. **Setup Frontend**

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

4. **Verify Setup**

- Backend: `curl http://localhost:3000/health`
- Frontend: Open `http://localhost:5173`

## Development Workflow

### Branch Naming Convention

```
feature/description      # New features
bugfix/description       # Bug fixes
hotfix/description       # Urgent fixes
docs/description         # Documentation
refactor/description     # Code refactoring
test/description         # Test additions
```

### Example Workflow

```bash
# Create feature branch
git checkout -b feature/add-book-categories

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: add book categories to listings"

# Push to your fork
git push origin feature/add-book-categories

# Create Pull Request on GitHub
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add email verification
fix(payment): resolve Razorpay signature validation
docs(readme): update setup instructions
refactor(api): simplify error handling
test(books): add book listing tests
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Updated documentation if needed
- [ ] Added tests for new features
- [ ] Tested locally

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] Tests pass locally
```

### Review Process

1. Automated checks must pass
2. At least one maintainer approval required
3. Address all review comments
4. Keep PR focused and small
5. Be responsive to feedback

## Coding Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  name?: string
}

const getUser = async (id: string): Promise<User> => {
  return await prisma.user.findUnique({ where: { id } })
}

// ❌ Bad
const getUser = async (id) => {
  return await prisma.user.findUnique({ where: { id } })
}
```

### React Components

```typescript
// ✅ Good - Named export, typed props
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export const Button = ({ onClick, children, variant = 'primary' }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  )
}

// ❌ Bad - Default export, untyped
export default function Button(props) {
  return <button>{props.children}</button>
}
```

### API Controllers

```typescript
// ✅ Good - Proper error handling
export const createBook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId
  const { title, author } = req.body

  if (!title || !author) {
    res.status(400).json({ error: 'Title and author are required' })
    return
  }

  const book = await prisma.bookListing.create({
    data: { title, author, lenderId: userId }
  })

  res.status(201).json({ success: true, data: { book } })
})

// ❌ Bad - No validation
export const createBook = async (req, res) => {
  const book = await prisma.bookListing.create({ data: req.body })
  res.json(book)
}
```

### Database Queries

```typescript
// ✅ Good - Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
  where: { accountStatus: 'ACTIVE' }
})

// ❌ Bad - Fetches all fields
const users = await prisma.user.findMany()
```

### Error Handling

```typescript
// ✅ Good
try {
  const result = await cloudinary.uploader.upload(file)
  return result.secure_url
} catch (error) {
  console.error('Image upload failed:', error)
  throw new Error('Failed to upload image')
}

// ❌ Bad
const result = await cloudinary.uploader.upload(file)
return result.secure_url
```

## Testing Guidelines

### Unit Tests

```typescript
// Example: Testing a utility function
describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    const distance = calculateDistance(0, 0, 0, 1)
    expect(distance).toBeCloseTo(111, 0) // ~111km
  })

  it('should return 0 for same coordinates', () => {
    const distance = calculateDistance(10, 20, 10, 20)
    expect(distance).toBe(0)
  })
})
```

### Integration Tests

```typescript
// Example: Testing API endpoint
describe('POST /api/v1/books', () => {
  it('should create a book listing', async () => {
    const response = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Book',
        author: 'Test Author',
        condition: 'NEW',
        rentalType: 'FREE',
      })

    expect(response.status).toBe(201)
    expect(response.body.data.book).toHaveProperty('id')
  })

  it('should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Book' })

    expect(response.status).toBe(400)
  })
})
```

### Component Tests

```typescript
// Example: Testing React component
describe('Button', () => {
  it('should render with text', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Project-Specific Guidelines

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_book_categories

# Never edit existing migrations
# Always create new migrations for schema changes
```

### Adding New Dependencies

```bash
# Check if dependency is needed
# Prefer well-maintained packages
# Check bundle size impact

# Add dependency
npm install package-name

# Update package.json and package-lock.json
git add package.json package-lock.json
```

### Environment Variables

```bash
# Add to .env.example with placeholder
NEW_API_KEY=your-api-key-here

# Document in README.md
# Never commit actual secrets
```

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email security@sharedreads.com
- **Chat**: Join our Discord (link in README)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to SharedReads! 🎉
