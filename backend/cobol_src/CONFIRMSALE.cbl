       IDENTIFICATION DIVISION.
       PROGRAM-ID. CONFIRMSALE.
       
       DATA DIVISION.
       
       WORKING-STORAGE SECTION.
       
       01 WS-COUNT              PIC 9(3).
       
       01 WS-I                  PIC 9(3).
       
       01 WS-PRODUCT-ID         PIC 9(5).
       
       01 WS-CURRENT-QTY        PIC 9(6).
       
       01 WS-ORDER-QTY          PIC 9(6).
       
       01 WS-NEW-QTY            PIC 9(6).
       
       PROCEDURE DIVISION.
       
           ACCEPT WS-COUNT
       
           DISPLAY "OK"
       
           PERFORM VARYING WS-I FROM 1 BY 1
               UNTIL WS-I > WS-COUNT
       
               ACCEPT WS-PRODUCT-ID
               ACCEPT WS-CURRENT-QTY
               ACCEPT WS-ORDER-QTY
       
               IF WS-CURRENT-QTY < WS-ORDER-QTY
       
                   DISPLAY "ERROR"
                   DISPLAY WS-PRODUCT-ID
       
                   STOP RUN
       
               END-IF
       
               SUBTRACT WS-ORDER-QTY
                   FROM WS-CURRENT-QTY
                   GIVING WS-NEW-QTY
       
               DISPLAY WS-PRODUCT-ID
               DISPLAY WS-NEW-QTY
       
           END-PERFORM
       
           STOP RUN.
           