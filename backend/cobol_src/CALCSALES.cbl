       IDENTIFICATION DIVISION.
       PROGRAM-ID. CALCSALES.

       DATA DIVISION.

       WORKING-STORAGE SECTION.

       01 WS-COUNT          PIC 9(4).
       01 WS-I              PIC 9(4).

       01 WS-SUBTOTAL       PIC 9(9)V99.
       01 WS-TOTAL          PIC 9(11)V99 VALUE 0.

       PROCEDURE DIVISION.

           ACCEPT WS-COUNT

           PERFORM VARYING WS-I FROM 1 BY 1
               UNTIL WS-I > WS-COUNT

               ACCEPT WS-SUBTOTAL

               ADD WS-SUBTOTAL TO WS-TOTAL

           END-PERFORM

           DISPLAY WS-TOTAL

           STOP RUN.