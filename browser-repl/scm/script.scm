(define $ (.$ js))

($ (lambda ()
     (let ((shell ($ "#shell")))
       ((.console shell)
        (make-object
         `((promptLabel . "=> ")
           (commandHandle . ,(lambda (line)
                               (if (and line (.length line))
                                   (try
                                    (print (eval-string line))
                                    (lambda (e) (string-append "Error: " e)))
                                   "")))
           (autofocus . #t)
           (animateScroll . #t)
           (promptHistory . #t)))))))
