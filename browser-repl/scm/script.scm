(define $ (.$ js))

($ (lambda ()
     (let ((env (new (.Environment scheme)))
           (shell ($ "#shell")))
       ((.console shell)
        (make-object
         `((promptLabel . "=> ")
           (commandHandle . ,(lambda (line)
                               (if (and line (.length line))
                                   (try
                                    ((.print scheme)
                                     ((.eval scheme) ((.read scheme) line) env))
                                    (lambda (e) (string-append "Error: " e)))
                                   "")))
           (autofocus . #t)
           (animateScroll . #t)
           (promptHistory . #t)))))))
