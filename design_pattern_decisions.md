# Fragile development.   (Fail early and fail loud)
Code should actively look for problems and stop as soon as something wrong is encountered.
Parameters that are passed for functions are checked with modifiers. 

# Restricted Access
Functions that are called from outside do not have access to contract state variables and functions.

# SelfDestructive
Сontract owner can call destroy the contract function.
Contract owner will receive all of the funds that the contract currently holds.

# Withdraw
User can withdraw to his own address. Balance states in contract are updated before calling transfer to prevent re-entrancy attacks. An exception is emergency withdraw function which can be used only by contract owner.

# Interruption
Contract owner can deactivate contract. Only Emergency withdraw function will be available and could transfer funds for store owners. Every other change contract state function will become unavailable.

# Speed Bump
Withdrawals can be suspended by contract owner.

# Circuit breaker (emergency stop) 
The Circuit Breaker pattern is essential because sometimes it is needed to stop their execution, for example maybe because errors are discovered in its code. The Marketplace smart contract uses the circuit breaker design pattern to stop the execution of any function that could modify the smart contract's storage.

# State Machine
Current contract works as an state machine. It is an abstract machine that can be in exactly one of a finite number of states at any given time. 