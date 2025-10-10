# Augen Auf - OpenMRS Medical Module

**Ophthalmology patient management system** built on OpenMRS 3.x ESM Framework.

## Features

- 🏥 Pre-surgery assessment forms (bilateral eye data)
- 👁️ BCVA validation (Best Corrected Visual Acuity)
- 🔄 Patient workflow state machine
- 🌐 OpenMRS 3.x microfrontend integration
- 📱 Offline support

---

## Quick Start

### 1. Install

```bash
yarn install
```

### 2. Develop

```bash
yarn start
# Module available at: /augen-auf
```

### 3. Build

```bash
yarn build
# Output: dist/openmrs-esm-augen-auf.js
```

---

## For Developers

### Single Agent (Traditional)

See [CLAUDE.md](./CLAUDE.md) for:
- OpenMRS integration patterns
- Medical data validation
- TDD workflow
- Quality gates

### Multi-Agent (Parallel Development)

**2-3x faster** using distributed agents on `distributed-main` branch:

1. **Branch Strategy**: [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) - distributed-main vs main
2. **Quick Start**: [QUICKSTART.md](./QUICKSTART.md) - 4 devs setup
3. **Full Workflow**: [DISTRIBUTED_WORKFLOW.md](./DISTRIBUTED_WORKFLOW.md) - Contract-first protocol
4. **Stream Partitioning**: [STREAM_PARTITIONING.md](./STREAM_PARTITIONING.md) - 4 streams, contracts
5. **Contracts**: [CONTRACTS.md](./CONTRACTS.md) - Interface negotiation, changes
6. **Augmented Coding**: [PROCEDURE.md](./PROCEDURE.md) - Slash commands, hooks, agents

**Branch Model**:
- Agents work on: `distributed-main` (quality-gated, distributed coordination)
- Humans review: `distributed-main` → `main` (production-ready)

**Example**: 4 devs, 4 streams, 6 weeks → Full project (vs 12+ weeks serial)

---

## Work Streams (from BACKLOG.md)

9 parallelizable streams:

1. **INFRA** - Testing & quality infrastructure
2. **DATA** - OpenMRS concepts & data model
3. **LAYOUT** - Application shell & navigation
4. **SIDEBAR** - Workflow navigation & filtering
5. **PATIENT-MGT** - Patient list & selection
6. **WORKFLOW** - State machine for patient journey
7. **FORMS** - Reusable form components (7 components)
8. **PRESURGERY** - Pre-surgery assessment form
9. **ACTIONS** - Protocol management & export

---

## Technologies

- **OpenMRS**: 3.x ESM Framework
- **React**: 18.x with TypeScript
- **Build**: Webpack 5 + SWC
- **Testing**: Vitest + React Testing Library
- **Styling**: Carbon Design System (OpenMRS)

---

## Medical Software Standards

✅ **TDD Mandatory** - Test before code
✅ **100% Coverage** - Medical validation logic
✅ **Zero Tolerance** - Quality gate must pass
✅ **PHI Protection** - No patient data in logs
✅ **Explicit Validation** - No implicit coercion

---

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Agent guidance & patterns
- **[BACKLOG.md](./BACKLOG.md)** - 9 work streams, task management
- **[QUICKSTART.md](./QUICKSTART.md)** - Multi-agent quick start
- **[DISTRIBUTED_WORKFLOW.md](./DISTRIBUTED_WORKFLOW.md)** - Parallel development
- **[PROCEDURE.md](./PROCEDURE.md)** - Augmented coding (hooks, commands, agents)

---

## License

MIT

---

## Agent Protocol v1.1

This project implements **Agent Protocol v1.1** for multi-agent coordination:

- 🔀 Parallel execution (2-3x speedup)
- 🔴🟢🧹 Mandatory TDD (RED-GREEN-REFACTOR)
- 🛡️ Zero-tolerance quality gates
- 🤝 Multi-agent task locking
- 🏥 Medical validation (100% coverage)

See [agent-protocol](https://github.com/user/agent-protocol) for framework source.
