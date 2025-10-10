# Initial Setup - distributed-main Branch

**Create distributed-main branch for agent coordination**

---

## Step 1: Create Branch

```bash
# In main repo
git checkout -b distributed-main
git push -u origin distributed-main
```

---

## Step 2: Verify

```bash
git branch -a
# Should show:
#   * distributed-main
#   main
#   remotes/origin/distributed-main
#   remotes/origin/main
```

---

## Step 3: Set Default

```bash
# For agent clones, default to distributed-main
git config branch.distributed-main.remote origin
git config branch.distributed-main.merge refs/heads/distributed-main
```

---

## Step 4: Clone for 4 Developers

```bash
cd ~/projects/playground

# Dev 1: Main repo (Stream A)
cd augen-auf-openmrs
git checkout distributed-main

# Dev 2: Clone (Stream B)
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-B

# Dev 3: Clone (Stream C)
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-C

# Dev 4: Clone (Stream D)
git clone -b distributed-main augen-auf-openmrs augen-auf-openmrs-D
```

---

## Step 5: Start Development

```bash
# Each terminal
cd <your-clone>
yarn install
/dev-watch  # Start dev server

# Dev 1 only (Week 1)
/contract-define foundation types
/contract-define foundation validation
git push origin distributed-main

# Dev 2-4 (Week 2+)
git pull origin distributed-main
# Review contracts
# Start implementation
```

---

## Verification

```bash
# Check you're on distributed-main
git branch
# Should show: * distributed-main

# Check remote
git remote -v
# Should show: origin pointing to distributed-main

# Check hooks loaded
ls .claude/hooks/enforce-distributed-main-branch.json
# Should exist
```

---

**Done**: All agents now work on distributed-main, hooks enforce branch compliance
