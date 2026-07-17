       IDENTIFICATION DIVISION.
       PROGRAM-ID. CUSTOMER-ENGINE.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 LK-ACTION           PIC X(15).
       01 LK-PARAM-2          PIC X(50).
       01 LK-PARAM-3          PIC X(50).
       01 LK-PARAM-4          PIC X(20).
       01 LK-PARAM-5          PIC X(20).
       01 LK-PARAM-6          PIC X(50).
       01 LK-PARAM-7          PIC X(20).

       01 WS-EMAIL-LEN        PIC 9(3) VALUE 0.
       01 WS-PASS-LEN         PIC 9(3) VALUE 0.
       01 WS-IDX              PIC 9(3) VALUE 1.
       01 WS-CHAR             PIC X(1).
       01 WS-HAS-DIGIT        PIC X(1) VALUE "N".
       01 WS-HAS-ALPHA        PIC X(1) VALUE "N".
       01 WS-HAS-AT           PIC X(1) VALUE "N".
       01 WS-TOTAL-QTY-NUM    PIC 9(5) VALUE 0.
       01 WS-GROSS-AMOUNT     PIC 9(7)V99 VALUE 0.
       01 WS-COMPUTED-DISCOUNT PIC 9(7)V99 VALUE 0.
       01 WS-PAST-ORDERS-COUNT PIC 9(3) VALUE 0.

       01 WS-RETURN-QTY       PIC 9(4) VALUE 0.
       01 WS-UNIT-PRICE       PIC 9(7)V99 VALUE 0.
       01 WS-ACTUAL-REFUND-PRICE PIC 9(7)V99 VALUE 0.
       01 WS-COMPUTED-SUBTOTAL   PIC 9(7)V99 VALUE 0.

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           ACCEPT LK-ACTION FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-2 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-3 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-4 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-5 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-6 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-7 FROM ARGUMENT-VALUE.

           EVALUATE FUNCTION TRIM(LK-ACTION)
               WHEN "SIGNUP"
                   PERFORM SIGNUP-PROCESS
               WHEN "LOGIN"
                   PERFORM LOGIN-PROCESS
               WHEN "CONFIRM_ORDER"
                   PERFORM ORDER-PROCESS
               WHEN "RETURN_ORDER"
                   PERFORM RETURN-PROCESS
               WHEN OTHER
                   DISPLAY "ERROR: Invalid action."
                   MOVE 9 TO RETURN-CODE
           END-EVALUATE
           GOBACK.

              SIGNUP-PROCESS.
           IF LK-PARAM-3 = "N"
               DISPLAY "Password must be at least 8 characters long."
               MOVE 5 TO RETURN-CODE
               GOBACK
           END-IF.

           IF LK-PARAM-4 = "N"
               DISPLAY "Password must mix characters and numbers."
               MOVE 6 TO RETURN-CODE
               GOBACK
           END-IF.

           IF LK-PARAM-2 = "Y"
               DISPLAY "Email is already exist, please login"
               MOVE 1 TO RETURN-CODE
               GOBACK
           ELSE
               DISPLAY "Registered successfully!"
               MOVE 0 TO RETURN-CODE
           END-IF.


       LOGIN-PROCESS.
           IF LK-PARAM-2 = "N"
               DISPLAY "You are not registered, please sign up!"
               MOVE 2 TO RETURN-CODE
           ELSE
               IF LK-PARAM-3 = "Y"
                   IF LK-PARAM-5 = "admin"
                       DISPLAY "Login successful!"
                       DISPLAY "Routing to Admin Dashboard..."
                       MOVE 3 TO RETURN-CODE
                   ELSE
                       DISPLAY "Login successful!"
                       MOVE 0 TO RETURN-CODE
                   END-IF
               ELSE
                   DISPLAY "Incorrect password. Please try again."
                   MOVE 1 TO RETURN-CODE
               END-IF
           END-IF.

       ORDER-PROCESS.
           COMPUTE WS-PAST-ORDERS-COUNT = FUNCTION NUMVAL(LK-PARAM-4).
           COMPUTE WS-GROSS-AMOUNT = FUNCTION NUMVAL(LK-PARAM-5).

           IF WS-PAST-ORDERS-COUNT = 0
               COMPUTE WS-COMPUTED-DISCOUNT = WS-GROSS-AMOUNT * 0.10
           ELSE
               MOVE 0 TO WS-COMPUTED-DISCOUNT
           END-IF.

           DISPLAY "COBOL_RESULT_DISCOUNT:" WS-COMPUTED-DISCOUNT.
           MOVE 0 TO RETURN-CODE.

       RETURN-PROCESS.
           COMPUTE WS-RETURN-QTY = FUNCTION NUMVAL(LK-PARAM-3).
           COMPUTE WS-UNIT-PRICE = FUNCTION NUMVAL(LK-PARAM-4).

           COMPUTE WS-ACTUAL-REFUND-PRICE = WS-UNIT-PRICE * 0.90.
           COMPUTE WS-COMPUTED-SUBTOTAL = 
           WS-RETURN-QTY * WS-ACTUAL-REFUND-PRICE.

           DISPLAY "COBOL_RESULT_SUBTOTAL:" WS-COMPUTED-SUBTOTAL.
           DISPLAY "COBOL_RESULT_UNIT_PRICE:" WS-ACTUAL-REFUND-PRICE.
           
           MOVE 0 TO RETURN-CODE.
