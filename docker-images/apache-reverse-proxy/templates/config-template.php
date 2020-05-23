<?php
	$staticAppAddress1 = getenv('STATIC_APP_1');
	$staticAppAddress2 = getenv('STATIC_APP_2');
	$dynamicAppAddress1 = getenv('DYNAMIC_APP_1');
	$dynamicAppAddress2 = getenv('DYNAMIC_APP_2');
?>

<VirtualHost *:80>
	ServerName labohttp.ch

	<Proxy "balancer://dynamic-cluster">
		BalancerMember 'http://<?php print "$dynamicAppAddress1"; ?>'
		BalancerMember 'http://<?php print "$dynamicAppAddress2"; ?>'
	</Proxy>

	<Proxy "balancer://static-cluster">
		BalancerMember 'http://<?php print "$staticAppAddress1"; ?>/'
		BalancerMember 'http://<?php print "$staticAppAddress2"; ?>/'
	</Proxy>

	# API
	ProxyPass '/api/' 'balancer://dynamic-cluster/'
	ProxyPassReverse '/api/' 'balancer://dynamic-cluster/'

	# Site web static
	ProxyPass '/' 'balancer://static-cluster/'
	ProxyPassReverse '/' 'balancer://mycluster1/'
	
</VirtualHost>
