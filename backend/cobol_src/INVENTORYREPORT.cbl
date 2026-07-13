       IDENTIFICATION DIVISION.
       PROGRAM-ID. INVENTORYREPORT.

       DATA DIVISION.

       WORKING-STORAGE SECTION.

       01 WS-PRODUCT-COUNT      PIC 9(4).

       01 WS-COUNTER            PIC 9(4).

       01 WS-QTY                PIC 9(6).

       01 WS-UNIT-PRICE         PIC 9(9)V99.

       01 WS-INVENTORY-VALUE    PIC 9(11)V99.

       01 WS-GRAND-TOTAL        PIC 9(13)V99 VALUE 0.

       PROCEDURE DIVISION.

      *-----------------------------------------
      * Read Number of Products
      *-----------------------------------------

           ACCEPT WS-PRODUCT-COUNT

      *-----------------------------------------
      * Process Every Product
      *-----------------------------------------

           PERFORM VARYING WS-COUNTER FROM 1 BY 1
               UNTIL WS-COUNTER > WS-PRODUCT-COUNT

               ACCEPT WS-QTY

               ACCEPT WS-UNIT-PRICE

               COMPUTE WS-INVENTORY-VALUE =
                       WS-QTY * WS-UNIT-PRICE

               ADD WS-INVENTORY-VALUE
                   TO WS-GRAND-TOTAL

      * Inventory Value for Current Product

               DISPLAY WS-INVENTORY-VALUE

           END-PERFORM

      *-----------------------------------------
      * Grand Total
      *-----------------------------------------

           DISPLAY WS-GRAND-TOTAL

           STOP RUN.
           