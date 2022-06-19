# Jotform Delimiter Substring widget
A modification of Jotform's Substring widget that allows for the delimiter-based extraction of dynamically-sized strings from form fields.

Demo form: https://www.jotform.com/220745979357067

Parameter Setup:
srcFieldId - Text
delimiter - Text
strNum - Text

Direct embed code:
```
<script src="WIDGETURL"></script>
<script type="text/javascript">
if (window.JFWidgetSubstrSetup) {window.JFWidgetSubstrSetup({"qid":"{qid}","source":"{srcFieldId}","delimiter":"{delimiter}", "strNum":"{strNum}", "qname":"{qname}"});}
</script>
```
