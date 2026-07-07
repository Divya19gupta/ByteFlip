## APIs 

1. GET  /problems          → all 305 problems
2. GET  /solved            → problems you've ticked
3. POST /solved/{id}       → tick a problem
4. DELETE /solved/{id}     → untick a problem
5. GET  /quiz              → random problem from solved (with recency bias)
6. POST /hint              → send problem id → get one line hint from LLM
7. POST /check             → send problem id + your approach → LLM validates