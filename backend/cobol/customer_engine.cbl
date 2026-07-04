       IDENTIFICATION DIVISION.
       PROGRAM-ID. CUSTOMER-ENGINE.

       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 LK-ACTION           PIC X(15).
       01 LK-PARAM-2          PIC X(20).
       01 LK-PARAM-3          PIC X(20).
       01 LK-PARAM-4          PIC X(20).
       01 LK-PARAM-5          PIC X(20).

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           ACCEPT LK-ACTION FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-2 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-3 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-4 FROM ARGUMENT-VALUE.
           ACCEPT LK-PARAM-5 FROM ARGUMENT-VALUE.

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
           IF LK-PARAM-2 = "Y"
               DISPLAY "Email is already exist, please login"
               MOVE 1 TO RETURN-CODE
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
           DISPLAY "Order Confirmed Successfully!"
           DISPLAY "Invoice logged in system ledger."
           MOVE 0 TO RETURN-CODE.

       RETURN-PROCESS.
           DISPLAY "COBOL ENGINE: Processing Order Return Sequence..."
           DISPLAY "Ledger audit status updated to: RETURNED"
           MOVE 0 TO RETURN-CODE.

