# 21 Feburary

## Task: Modify Script

### Research about how a contract can be Upgradable

I searched about how a contract can be Upgradable to detect and mark them as not whitelistable.

## Found solution

Now, we are checking all the functions and function bodies. If a collection contains any function that is unknown to our script, we will revert the execution with reason. Also if contract doesn’t contains a function which we are expecting from it, we throw error.
As, we are checking the body of all functions. There is no need to check if the contract is upgradable, because we are matching function bodies. And no unknown functions are allowed.
