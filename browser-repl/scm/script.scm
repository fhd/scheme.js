(define (format result)
  (if (array? result)
      (reduce result (lambda (x y)
		       (string-append x "\n" y)))
      (string-append result "\n")))

(.$ js
    (lambda ()
      (let ((env (new scheme.Environment))
	    (.$ js "#shell"))
	(.console
	 shell
	 (hash ((promptLabel "=> ")
		(commandHandle (lambda (line)
				 (if (= (get line length) 0)
				     ""
				     (try (format (.eval scheme line env))
					  (catch e (string-append "Error: "
								  e))))))
		(autofocus #t)
		(animateScroll #t)
		(promptHistory #t)))))))
